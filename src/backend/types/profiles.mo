import Common "common";

module {
  public type Profile = {
    id : Common.UserId;
    role : Common.Role;
    name : Text;
    email : Text;
    avatar_url : ?Text;
    phone : ?Text;
    is_active : Bool;
    created_at : Common.Timestamp;
    updated_at : Common.Timestamp;
  };

  public type CreateProfileRequest = {
    role : Common.Role;
    name : Text;
    email : Text;
    avatar_url : ?Text;
    phone : ?Text;
  };

  public type UpdateProfileRequest = {
    name : ?Text;
    email : ?Text;
    avatar_url : ?Text;
    phone : ?Text;
    is_active : ?Bool;
  };
};
