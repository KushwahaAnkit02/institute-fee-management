import Time "mo:core/Time";

module {
  public type UserId = Text; // Principal as Text
  public type Timestamp = Time.Time;

  public type Role = {
    #admin;
    #student;
  };

  public type PaymentMethod = {
    #cash;
    #online;
    #cheque;
    #card;
  };

  public type NotificationType = {
    #custom;
    #payment_received;
    #fee_due;
    #overdue;
  };
};
