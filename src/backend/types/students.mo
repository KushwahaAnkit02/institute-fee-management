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
    phone : ?Text;
    gender : ?Text;
    dob : ?Text;
    address : ?Text;
    parent_name : ?Text;
    parent_phone : ?Text;
    section : ?Text;
    enrollment_number : ?Text;
    admission_date : ?Text;
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
    phone : ?Text;
    gender : ?Text;
    dob : ?Text;
    address : ?Text;
    parent_name : ?Text;
    parent_phone : ?Text;
    section : ?Text;
    enrollment_number : ?Text;
    admission_date : ?Text;
  };

  public type UpdateStudentRequest = {
    name : ?Text;
    email : ?Text;
    class_ : ?Text;
    course : ?Text;
    monthly_fee : ?Nat;
    is_active : ?Bool;
    phone : ?Text;
    gender : ?Text;
    dob : ?Text;
    address : ?Text;
    parent_name : ?Text;
    parent_phone : ?Text;
    section : ?Text;
    enrollment_number : ?Text;
    admission_date : ?Text;
  };
};
