import Common "common";

module {
  public type Student = {
    id : Text;
    profile_id : ?Common.UserId;
    admin_id : Common.UserId;
    name : Text;
    email : Text;
    class_ : Text;
    course : Text;
    monthly_fee : Nat;
    joined_date : Common.Timestamp;
    fee_start_date : Common.Timestamp;
    is_active : Bool;
    created_at : Common.Timestamp;
    updated_at : Common.Timestamp;
  };

  public type CreateStudentRequest = {
    name : Text;
    email : Text;
    class_ : Text;
    course : Text;
    monthly_fee : Nat;
    joined_date : Common.Timestamp;
    fee_start_date : Common.Timestamp;
  };

  public type UpdateStudentRequest = {
    name : ?Text;
    email : ?Text;
    class_ : ?Text;
    course : ?Text;
    monthly_fee : ?Nat;
    is_active : ?Bool;
  };
};
