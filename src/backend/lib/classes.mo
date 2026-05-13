import Map "mo:core/Map";
import Time "mo:core/Time";
import ClassTypes "../types/classes";
import Common "../types/common";

module {
  public type ClassMap = Map.Map<Text, ClassTypes.ClassRecord>;
  public type SectionMap = Map.Map<Text, ClassTypes.SectionRecord>;

  func newClassId(adminId : Common.UserId, now : Common.Timestamp) : Text {
    "cls_" # adminId # "_" # now.toText();
  };

  func newSectionId(classId : Text, now : Common.Timestamp) : Text {
    "sec_" # classId # "_" # now.toText();
  };

  public func createClass(
    classes : ClassMap,
    adminId : Common.UserId,
    form : ClassTypes.CreateClassForm,
  ) : ClassTypes.ClassRecord {
    let now = Time.now();
    let id = newClassId(adminId, now);
    let record : ClassTypes.ClassRecord = {
      id;
      admin_id = adminId;
      name = form.name;
      description = form.description;
      created_at = now;
    };
    classes.add(id, record);
    record;
  };

  public func getClassesByAdmin(
    classes : ClassMap,
    adminId : Common.UserId,
  ) : [ClassTypes.ClassRecord] {
    classes.values().filter(func(c : ClassTypes.ClassRecord) : Bool {
      c.admin_id == adminId;
    }).toArray();
  };

  public func updateClass(
    classes : ClassMap,
    classId : Text,
    adminId : Common.UserId,
    form : ClassTypes.UpdateClassForm,
  ) : ?ClassTypes.ClassRecord {
    switch (classes.get(classId)) {
      case null null;
      case (?c) {
        if (c.admin_id != adminId) return null;
        let updated : ClassTypes.ClassRecord = {
          c with
          name = form.name;
          description = form.description;
        };
        classes.add(classId, updated);
        ?updated;
      };
    };
  };

  public func deleteClass(
    classes : ClassMap,
    classId : Text,
    adminId : Common.UserId,
  ) : Bool {
    switch (classes.get(classId)) {
      case null false;
      case (?c) {
        if (c.admin_id != adminId) return false;
        classes.remove(classId);
        true;
      };
    };
  };

  public func createSection(
    sections : SectionMap,
    adminId : Common.UserId,
    form : ClassTypes.CreateSectionForm,
  ) : ClassTypes.SectionRecord {
    let now = Time.now();
    let id = newSectionId(form.class_id, now);
    let record : ClassTypes.SectionRecord = {
      id;
      class_id = form.class_id;
      admin_id = adminId;
      name = form.name;
      created_at = now;
    };
    sections.add(id, record);
    record;
  };

  public func getSectionsByClass(
    sections : SectionMap,
    classId : Text,
  ) : [ClassTypes.SectionRecord] {
    sections.values().filter(func(s : ClassTypes.SectionRecord) : Bool {
      s.class_id == classId;
    }).toArray();
  };

  public func getSectionsByAdmin(
    sections : SectionMap,
    adminId : Common.UserId,
  ) : [ClassTypes.SectionRecord] {
    sections.values().filter(func(s : ClassTypes.SectionRecord) : Bool {
      s.admin_id == adminId;
    }).toArray();
  };

  public func deleteSection(
    sections : SectionMap,
    sectionId : Text,
    adminId : Common.UserId,
  ) : Bool {
    switch (sections.get(sectionId)) {
      case null false;
      case (?s) {
        if (s.admin_id != adminId) return false;
        sections.remove(sectionId);
        true;
      };
    };
  };
};
