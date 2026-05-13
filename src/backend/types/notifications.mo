import Common "common";

module {
  public type Notification = {
    id : Text;
    admin_id : Common.UserId;
    student_id : ?Common.UserId;
    title : Text;
    message : Text;
    type_ : Common.NotificationType;
    is_read : Bool;
    created_at : Common.Timestamp;
  };

  public type CreateNotificationRequest = {
    student_id : ?Common.UserId;
    title : Text;
    message : Text;
    type_ : Common.NotificationType;
  };
};
