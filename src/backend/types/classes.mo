import Common "common";

module {
  public type ClassRecord = {
    id : Text;
    admin_id : Common.UserId;
    name : Text;
    description : Text;
    created_at : Common.Timestamp;
  };

  public type SectionRecord = {
    id : Text;
    class_id : Text;
    admin_id : Common.UserId;
    name : Text;
    created_at : Common.Timestamp;
  };

  public type CreateClassForm = {
    name : Text;
    description : Text;
  };

  public type CreateSectionForm = {
    class_id : Text;
    name : Text;
  };

  public type UpdateClassForm = {
    name : Text;
    description : Text;
  };
};
