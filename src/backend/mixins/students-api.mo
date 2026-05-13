import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import StudentTypes "../types/students";
import AdminTypes "../types/admins";
import Common "../types/common";
import StudentLib "../lib/students";
import AdminLib "../lib/admins";

mixin (
  accessControlState : AccessControl.AccessControlState,
  students : Map.Map<Text, StudentTypes.Student>,
  admins : Map.Map<Text, AdminTypes.Admin>,
) {
  /// Admin: create a new student under the caller's admin account.
  public shared ({ caller }) func createStudent(
    req : StudentTypes.CreateStudentRequest
  ) : async StudentTypes.Student {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        StudentLib.createStudent(students, admin.id, req);
      };
    };
  };

  /// Admin: list all students belonging to the caller's admin account.
  public query ({ caller }) func getStudentsByAdmin() : async [StudentTypes.Student] {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null [];
      case (?admin) {
        StudentLib.getStudentsByAdmin(students, admin.id);
      };
    };
  };

  /// Student: return the student record linked to the calling principal.
  public query ({ caller }) func getStudentByProfile() : async ?StudentTypes.Student {
    StudentLib.getStudentByProfile(students, caller.toText());
  };

  /// Admin: update a student record (must belong to caller's admin account).
  public shared ({ caller }) func updateStudent(
    studentId : Text,
    req : StudentTypes.UpdateStudentRequest,
  ) : async ?StudentTypes.Student {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        StudentLib.updateStudent(students, studentId, admin.id, req);
      };
    };
  };
};
