import Common "common";

module {
  public type Admin = {
    id : Common.UserId;
    profile_id : Common.UserId;
    institute_name : Text;
    institute_code : Text;
    address : ?Text;
    created_at : Common.Timestamp;
  };

  public type CreateAdminRequest = {
    institute_name : Text;
    institute_code : Text;
    address : ?Text;
  };
};
