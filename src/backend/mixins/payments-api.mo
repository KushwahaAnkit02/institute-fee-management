import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import PaymentTypes "../types/payments";
import StudentTypes "../types/students";
import AdminTypes "../types/admins";
import NotifTypes "../types/notifications";
import Common "../types/common";
import PaymentLib "../lib/payments";
import StudentLib "../lib/students";
import AdminLib "../lib/admins";
import NotifLib "../lib/notifications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  payments : Map.Map<Text, PaymentTypes.MonthlyPayment>,
  students : Map.Map<Text, StudentTypes.Student>,
  admins : Map.Map<Text, AdminTypes.Admin>,
  notifications : Map.Map<Text, NotifTypes.Notification>,
) {
  /// Admin: record a new monthly payment for a student.
  public shared ({ caller }) func recordPayment(
    req : PaymentTypes.RecordPaymentRequest
  ) : async PaymentTypes.MonthlyPayment {
    let userId = caller.toText();
    let admin = switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?a) a;
    };
    // Verify the student belongs to this admin
    let student = switch (students.get(req.student_id)) {
      case null Runtime.trap("Student not found");
      case (?s) {
        if (s.admin_id != admin.id) Runtime.trap("Student does not belong to this admin");
        s;
      };
    };
    let payment = PaymentLib.recordPayment(payments, admin.id, req);
    // Auto-create payment_received notification for the student
    switch (student.profile_id) {
      case (?pid) {
        NotifLib.createPaymentNotification(
          notifications,
          admin.id,
          pid,
          student.name,
          req.month,
          req.amount_paid,
        );
      };
      case null {};
    };
    payment;
  };

  /// Admin: list all payments belonging to the caller's admin account.
  public query ({ caller }) func getPaymentsByAdmin() : async [PaymentTypes.MonthlyPayment] {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null [];
      case (?admin) PaymentLib.getPaymentsByAdmin(payments, admin.id);
    };
  };

  /// Student: list all payments for the student linked to the caller.
  public query ({ caller }) func getPaymentsByStudent() : async [PaymentTypes.MonthlyPayment] {
    let userId = caller.toText();
    switch (StudentLib.getStudentByProfile(students, userId)) {
      case null [];
      case (?s) PaymentLib.getPaymentsByStudent(payments, s.id);
    };
  };

  /// Admin: update a payment record (must belong to caller's admin account).
  public shared ({ caller }) func updatePayment(
    paymentId : Text,
    req : PaymentTypes.UpdatePaymentRequest,
  ) : async ?PaymentTypes.MonthlyPayment {
    let userId = caller.toText();
    let admin = switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?a) a;
    };
    PaymentLib.updatePayment(payments, paymentId, admin.id, req);
  };

  /// Admin: delete a payment record (must belong to caller's admin account).
  public shared ({ caller }) func deletePayment(
    paymentId : Text
  ) : async Bool {
    let userId = caller.toText();
    let admin = switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?a) a;
    };
    PaymentLib.deletePayment(payments, paymentId, admin.id);
  };
};
