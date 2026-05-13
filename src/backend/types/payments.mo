import Common "common";

module {
  public type MonthlyPayment = {
    id : Text;
    student_id : Text;
    admin_id : Common.UserId;
    month : Text; // format YYYY-MM
    amount_paid : Nat;
    payment_method : Common.PaymentMethod;
    notes : ?Text;
    payment_date : Common.Timestamp;
    created_at : Common.Timestamp;
  };

  public type RecordPaymentRequest = {
    student_id : Text;
    month : Text;
    amount_paid : Nat;
    payment_method : Common.PaymentMethod;
    notes : ?Text;
    payment_date : Common.Timestamp;
  };

  public type UpdatePaymentRequest = {
    amount_paid : ?Nat;
    payment_method : ?Common.PaymentMethod;
    notes : ?Text;
    payment_date : ?Common.Timestamp;
  };
};
