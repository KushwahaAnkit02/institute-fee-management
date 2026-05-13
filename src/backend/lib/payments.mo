import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import PaymentTypes "../types/payments";
import Common "../types/common";

module {
  public type PaymentMap = Map.Map<Text, PaymentTypes.MonthlyPayment>;

  func newPaymentId(adminId : Common.UserId, now : Common.Timestamp) : Text {
    "p_" # adminId # "_" # now.toText();
  };

  public func recordPayment(
    payments : PaymentMap,
    adminId : Common.UserId,
    req : PaymentTypes.RecordPaymentRequest,
  ) : PaymentTypes.MonthlyPayment {
    let now = Time.now();
    let id = newPaymentId(adminId, now);
    let payment : PaymentTypes.MonthlyPayment = {
      id;
      student_id = req.student_id;
      admin_id = adminId;
      month = req.month;
      amount_paid = req.amount_paid;
      payment_method = req.payment_method;
      notes = req.notes;
      payment_date = req.payment_date;
      created_at = now;
    };
    payments.add(id, payment);
    payment;
  };

  public func getPaymentsByAdmin(
    payments : PaymentMap,
    adminId : Common.UserId,
  ) : [PaymentTypes.MonthlyPayment] {
    payments.values().filter(func(p : PaymentTypes.MonthlyPayment) : Bool {
      p.admin_id == adminId;
    }).toArray();
  };

  public func getPaymentsByStudent(
    payments : PaymentMap,
    studentId : Text,
  ) : [PaymentTypes.MonthlyPayment] {
    payments.values().filter(func(p : PaymentTypes.MonthlyPayment) : Bool {
      p.student_id == studentId;
    }).toArray();
  };

  public func updatePayment(
    payments : PaymentMap,
    paymentId : Text,
    adminId : Common.UserId,
    req : PaymentTypes.UpdatePaymentRequest,
  ) : ?PaymentTypes.MonthlyPayment {
    switch (payments.get(paymentId)) {
      case null null;
      case (?p) {
        if (p.admin_id != adminId) return null;
        let updated : PaymentTypes.MonthlyPayment = {
          p with
          amount_paid = switch (req.amount_paid) { case (?a) a; case null p.amount_paid };
          payment_method = switch (req.payment_method) { case (?m) m; case null p.payment_method };
          notes = switch (req.notes) { case (?n) ?n; case null p.notes };
          payment_date = switch (req.payment_date) { case (?d) d; case null p.payment_date };
        };
        payments.add(paymentId, updated);
        ?updated;
      };
    };
  };

  public func deletePayment(
    payments : PaymentMap,
    paymentId : Text,
    adminId : Common.UserId,
  ) : Bool {
    switch (payments.get(paymentId)) {
      case null false;
      case (?p) {
        if (p.admin_id != adminId) return false;
        payments.remove(paymentId);
        true;
      };
    };
  };
};
