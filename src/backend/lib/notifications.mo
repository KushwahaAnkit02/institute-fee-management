import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import NotifTypes "../types/notifications";
import Common "../types/common";

module {
  public type NotificationMap = Map.Map<Text, NotifTypes.Notification>;

  func newNotifId(adminId : Common.UserId, now : Common.Timestamp, suffix : Text) : Text {
    "n_" # adminId # "_" # now.toText() # suffix;
  };

  // Create a single notification record and insert it into the map
  func insertNotification(
    notifications : NotificationMap,
    id : Text,
    adminId : Common.UserId,
    studentId : ?Common.UserId,
    title : Text,
    message : Text,
    type_ : Common.NotificationType,
    now : Common.Timestamp,
  ) : NotifTypes.Notification {
    let notif : NotifTypes.Notification = {
      id;
      admin_id = adminId;
      student_id = studentId;
      title;
      message;
      type_;
      is_read = false;
      created_at = now;
    };
    notifications.add(id, notif);
    notif;
  };

  public func createNotification(
    notifications : NotificationMap,
    adminId : Common.UserId,
    req : NotifTypes.CreateNotificationRequest,
  ) : NotifTypes.Notification {
    let now = Time.now();
    let id = newNotifId(adminId, now, "");
    insertNotification(notifications, id, adminId, req.student_id, req.title, req.message, req.type_, now);
  };

  // Create a payment_received notification for a specific student (called from payments API)
  public func createPaymentNotification(
    notifications : NotificationMap,
    adminId : Common.UserId,
    studentId : Common.UserId,
    studentName : Text,
    month : Text,
    amount : Nat,
  ) : () {
    let now = Time.now();
    let id = newNotifId(adminId, now, "_pay");
    let title = "Payment Received";
    let message = "Payment of " # amount.toText() # " received from " # studentName # " for " # month;
    ignore insertNotification(notifications, id, adminId, ?studentId, title, message, #payment_received, now);
  };

  // Broadcast: create one notification per student profile under this admin
  public func broadcastNotification(
    notifications : NotificationMap,
    adminId : Common.UserId,
    studentIds : [Common.UserId],
    title : Text,
    message : Text,
    type_ : Common.NotificationType,
  ) : () {
    let now = Time.now();
    var i = 0;
    for (sid in studentIds.values()) {
      let id = newNotifId(adminId, now, "_" # i.toText());
      ignore insertNotification(notifications, id, adminId, ?sid, title, message, type_, now);
      i += 1;
    };
  };

  public func getNotificationsByAdmin(
    notifications : NotificationMap,
    adminId : Common.UserId,
  ) : [NotifTypes.Notification] {
    notifications.values().filter(func(n : NotifTypes.Notification) : Bool {
      n.admin_id == adminId;
    }).toArray();
  };

  public func getNotificationsByStudent(
    notifications : NotificationMap,
    studentId : Common.UserId,
  ) : [NotifTypes.Notification] {
    notifications.values().filter(func(n : NotifTypes.Notification) : Bool {
      switch (n.student_id) {
        case (?sid) sid == studentId;
        case null false;
      };
    }).toArray();
  };

  public func markNotificationRead(
    notifications : NotificationMap,
    notifId : Text,
  ) : Bool {
    switch (notifications.get(notifId)) {
      case null false;
      case (?n) {
        notifications.add(notifId, { n with is_read = true });
        true;
      };
    };
  };

  public func markAllNotificationsRead(
    notifications : NotificationMap,
    adminId : Common.UserId,
  ) : Nat {
    var count = 0;
    for ((id, n) in notifications.entries()) {
      if (n.admin_id == adminId and not n.is_read) {
        notifications.add(id, { n with is_read = true });
        count += 1;
      };
    };
    count;
  };
};
