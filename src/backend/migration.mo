import Map "mo:core/Map";
import StudentTypes "types/students";
import ClassTypes "types/classes";

module {
  // --- Old types: Student shape as it exists in the currently deployed stable state ---
  // The address and other optional fields are already present in stable storage
  // (a previous migration added them). This OldStudent must exactly match
  // what is currently stored so the compatibility check passes.
  type OldStudent = {
    id : Text;
    profile_id : ?Text;
    admin_id : Text;
    name : Text;
    email : Text;
    class_ : Text;
    course : Text;
    monthly_fee : Nat;
    joined_date : Int;
    fee_start_date : Int;
    is_active : Bool;
    phone : ?Text;
    gender : ?Text;
    dob : ?Text;
    address : ?Text;
    parent_name : ?Text;
    parent_phone : ?Text;
    section : ?Text;
    enrollment_number : ?Text;
    admission_date : ?Text;
    created_at : Int;
    updated_at : Int;
  };

  // --- OldActor: stable fields from the previous deployed version ---
  // Must include ALL stable vars that existed in the previously deployed actor.
  // Listing classes and sections here prevents "cannot be implicitly discarded" errors.
  type OldActor = {
    students : Map.Map<Text, OldStudent>;
    classes : Map.Map<Text, ClassTypes.ClassRecord>;
    sections : Map.Map<Text, ClassTypes.SectionRecord>;
  };

  // --- NewActor: stable fields in the new version ---
  type NewActor = {
    students : Map.Map<Text, StudentTypes.Student>;
    classes : Map.Map<Text, ClassTypes.ClassRecord>;
    sections : Map.Map<Text, ClassTypes.SectionRecord>;
  };

  // Migrate OldStudent → Student (types are now identical; this is a pass-through)
  func migrateStudent(_id : Text, old : OldStudent) : StudentTypes.Student {
    old;
  };

  public func run(old : OldActor) : NewActor {
    let students = old.students.map<Text, OldStudent, StudentTypes.Student>(migrateStudent);
    // Preserve existing classes/sections from old stable state, or use empty maps if not present.
    {
      students;
      classes = old.classes;
      sections = old.sections;
    };
  };
};
