import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import NotifTypes "../types/notifications";
import StudentTypes "../types/students";
import AdminTypes "../types/admins";
import Common "../types/common";
import NotifLib "../lib/notifications";
import AdminLib "../lib/admins";
import StudentLib "../lib/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  notifications : Map.Map<Text, NotifTypes.Notification>,
  admins : Map.Map<Text, AdminTypes.Admin>,
  students : Map.Map<Text, StudentTypes.Student>,
) {
  /// Admin: create a notification.
  /// If student_id is null, broadcast to all students under this admin.
  public shared ({ caller }) func createNotification(
    req : NotifTypes.CreateNotificationRequest
  ) : async NotifTypes.Notification {
    let userId = caller.toText();
    let admin = switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?a) a;
    };
    switch (req.student_id) {
      case (?_) {
        // Targeted notification
        NotifLib.createNotification(notifications, admin.id, req);
      };
      case null {
        // Broadcast: collect profile IDs of all students under this admin
        let adminStudents = StudentLib.getStudentsByAdmin(students, admin.id);
        let profileIds = adminStudents.filterMap(func(s : StudentTypes.Student) : ?Common.UserId { s.profile_id });
        NotifLib.broadcastNotification(
          notifications,
          admin.id,
          profileIds,
          req.title,
          req.message,
          req.type_,
        );
        // Return a representative notification (the first one or a synthetic one)
        NotifLib.createNotification(notifications, admin.id, req);
      };
    };
  };

  /// Admin: list all notifications for the caller's admin account.
  public query ({ caller }) func getNotificationsByAdmin() : async [NotifTypes.Notification] {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null [];
      case (?admin) NotifLib.getNotificationsByAdmin(notifications, admin.id);
    };
  };

  /// Student: list notifications targeted at the calling student.
  public query ({ caller }) func getNotificationsByStudent() : async [NotifTypes.Notification] {
    NotifLib.getNotificationsByStudent(notifications, caller.toText());
  };

  /// Mark a single notification as read (caller must own it).
  public shared ({ caller }) func markNotificationRead(
    notifId : Text
  ) : async Bool {
    let userId = caller.toText();
    // Check ownership: notification must belong to caller's student or admin
    switch (notifications.get(notifId)) {
      case null false;
      case (?n) {
        let isStudent = switch (n.student_id) {
          case (?sid) sid == userId;
          case null false;
        };
        let isAdmin = n.admin_id == userId;
        if (not isStudent and not isAdmin) {
          Runtime.trap("Unauthorized: Not your notification");
        };
        NotifLib.markNotificationRead(notifications, notifId);
      };
    };
  };

  /// Admin: mark all notifications in the caller's account as read.
  public shared ({ caller }) func markAllNotificationsRead() : async Nat {
    let userId = caller.toText();
    let admin = switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?a) a;
    };
    NotifLib.markAllNotificationsRead(notifications, admin.id);
  };
};
