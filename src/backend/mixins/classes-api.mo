import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import ClassTypes "../types/classes";
import AdminTypes "../types/admins";
import Common "../types/common";
import ClassLib "../lib/classes";
import AdminLib "../lib/admins";

mixin (
  accessControlState : AccessControl.AccessControlState,
  classes : Map.Map<Text, ClassTypes.ClassRecord>,
  sections : Map.Map<Text, ClassTypes.SectionRecord>,
  admins : Map.Map<Text, AdminTypes.Admin>,
) {
  /// Admin: create a new class.
  public shared ({ caller }) func createClass(
    form : ClassTypes.CreateClassForm
  ) : async ClassTypes.ClassRecord {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        ClassLib.createClass(classes, admin.id, form);
      };
    };
  };

  /// Admin: list all classes belonging to the caller's admin account.
  public query ({ caller }) func getClassesByAdmin() : async [ClassTypes.ClassRecord] {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null [];
      case (?admin) {
        ClassLib.getClassesByAdmin(classes, admin.id);
      };
    };
  };

  /// Admin: update a class record.
  public shared ({ caller }) func updateClass(
    classId : Text,
    form : ClassTypes.UpdateClassForm,
  ) : async ?ClassTypes.ClassRecord {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        ClassLib.updateClass(classes, classId, admin.id, form);
      };
    };
  };

  /// Admin: delete a class.
  public shared ({ caller }) func deleteClass(
    classId : Text
  ) : async Bool {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        ClassLib.deleteClass(classes, classId, admin.id);
      };
    };
  };

  /// Admin: create a new section under a class.
  public shared ({ caller }) func createSection(
    form : ClassTypes.CreateSectionForm
  ) : async ClassTypes.SectionRecord {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        ClassLib.createSection(sections, admin.id, form);
      };
    };
  };

  /// List sections for a given class id (accessible to admins and students).
  public query func getSectionsByClass(
    classId : Text
  ) : async [ClassTypes.SectionRecord] {
    ClassLib.getSectionsByClass(sections, classId);
  };

  /// Admin: list all sections belonging to the caller's admin account.
  public query ({ caller }) func getSectionsByAdmin() : async [ClassTypes.SectionRecord] {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null [];
      case (?admin) {
        ClassLib.getSectionsByAdmin(sections, admin.id);
      };
    };
  };

  /// Admin: delete a section.
  public shared ({ caller }) func deleteSection(
    sectionId : Text
  ) : async Bool {
    let userId = caller.toText();
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case null Runtime.trap("Admin record not found for caller");
      case (?admin) {
        ClassLib.deleteSection(sections, sectionId, admin.id);
      };
    };
  };
};
