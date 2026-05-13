import Map "mo:core/Map";
import StudentTypes "types/students";
import ClassTypes "types/classes";

module {
  // --- Old types (Student before the 9 new optional fields) ---
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
    created_at : Int;
    updated_at : Int;
  };

  // --- OldActor: stable fields from the previous deployed version ---
  type OldActor = {
    students : Map.Map<Text, OldStudent>;
  };

  // --- NewActor: stable fields in the new version ---
  type NewActor = {
    students : Map.Map<Text, StudentTypes.Student>;
    classes : Map.Map<Text, ClassTypes.ClassRecord>;
    sections : Map.Map<Text, ClassTypes.SectionRecord>;
  };

  // Migrate OldStudent → Student by adding all 9 new optional fields as null
  func migrateStudent(_id : Text, old : OldStudent) : StudentTypes.Student {
    {
      id = old.id;
      profile_id = old.profile_id;
      admin_id = old.admin_id;
      name = old.name;
      email = old.email;
      class_ = old.class_;
      course = old.course;
      monthly_fee = old.monthly_fee;
      joined_date = old.joined_date;
      fee_start_date = old.fee_start_date;
      is_active = old.is_active;
      phone = null;
      gender = null;
      dob = null;
      address = null;
      parent_name = null;
      parent_phone = null;
      section = null;
      enrollment_number = null;
      admission_date = null;
      created_at = old.created_at;
      updated_at = old.updated_at;
    };
  };

  public func run(old : OldActor) : NewActor {
    let students = old.students.map<Text, OldStudent, StudentTypes.Student>(migrateStudent);
    {
      students;
      classes = Map.empty<Text, ClassTypes.ClassRecord>();
      sections = Map.empty<Text, ClassTypes.SectionRecord>();
    };
  };
};
