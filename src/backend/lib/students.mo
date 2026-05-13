import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import StudentTypes "../types/students";
import Common "../types/common";

module {
  public type StudentMap = Map.Map<Text, StudentTypes.Student>;

  // Generate a student id from admin id and timestamp
  func newStudentId(adminId : Common.UserId, now : Common.Timestamp) : Text {
    "s_" # adminId # "_" # now.toText();
  };

  public func createStudent(
    students : StudentMap,
    adminId : Common.UserId,
    req : StudentTypes.CreateStudentRequest,
  ) : StudentTypes.Student {
    let now = Time.now();
    let id = newStudentId(adminId, now);
    let student : StudentTypes.Student = {
      id;
      profile_id = null;
      admin_id = adminId;
      name = req.name;
      email = req.email;
      class_ = req.class_;
      course = req.course;
      monthly_fee = req.monthly_fee;
      joined_date = req.joined_date;
      fee_start_date = req.fee_start_date;
      is_active = true;
      created_at = now;
      updated_at = now;
    };
    students.add(id, student);
    student;
  };

  public func getStudentsByAdmin(
    students : StudentMap,
    adminId : Common.UserId,
  ) : [StudentTypes.Student] {
    students.values().filter(func(s : StudentTypes.Student) : Bool {
      s.admin_id == adminId;
    }).toArray();
  };

  // Find by profile_id (principal Text)
  public func getStudentByProfile(
    students : StudentMap,
    profileId : Common.UserId,
  ) : ?StudentTypes.Student {
    students.values().find(func(s : StudentTypes.Student) : Bool {
      switch (s.profile_id) {
        case (?pid) pid == profileId;
        case null false;
      };
    });
  };

  // Find unlinked student by email (for auto-linking on signup)
  public func findStudentByEmail(
    students : StudentMap,
    email : Text,
  ) : ?StudentTypes.Student {
    students.values().find(func(s : StudentTypes.Student) : Bool {
      s.email == email;
    });
  };

  // Link a profile to a student (called during student createProfile)
  public func linkStudentProfile(
    students : StudentMap,
    studentId : Text,
    profileId : Common.UserId,
  ) : Bool {
    switch (students.get(studentId)) {
      case null false;
      case (?s) {
        let updated = { s with profile_id = ?profileId; updated_at = Time.now() };
        students.add(studentId, updated);
        true;
      };
    };
  };

  public func updateStudent(
    students : StudentMap,
    studentId : Text,
    adminId : Common.UserId,
    req : StudentTypes.UpdateStudentRequest,
  ) : ?StudentTypes.Student {
    switch (students.get(studentId)) {
      case null null;
      case (?s) {
        if (s.admin_id != adminId) return null;
        let updated : StudentTypes.Student = {
          s with
          name = switch (req.name) { case (?n) n; case null s.name };
          email = switch (req.email) { case (?e) e; case null s.email };
          class_ = switch (req.class_) { case (?c) c; case null s.class_ };
          course = switch (req.course) { case (?c) c; case null s.course };
          monthly_fee = switch (req.monthly_fee) { case (?f) f; case null s.monthly_fee };
          is_active = switch (req.is_active) { case (?a) a; case null s.is_active };
          updated_at = Time.now();
        };
        students.add(studentId, updated);
        ?updated;
      };
    };
  };
};
