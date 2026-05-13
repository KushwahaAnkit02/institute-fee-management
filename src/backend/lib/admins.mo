import Map "mo:core/Map";
import Time "mo:core/Time";
import AdminTypes "../types/admins";
import Common "../types/common";

module {
  public type AdminMap = Map.Map<Text, AdminTypes.Admin>;

  // Admin id = profileId (one admin per principal)
  public func createAdmin(
    admins : AdminMap,
    profileId : Common.UserId,
    req : AdminTypes.CreateAdminRequest,
  ) : AdminTypes.Admin {
    let admin : AdminTypes.Admin = {
      id = profileId;
      profile_id = profileId;
      institute_name = req.institute_name;
      institute_code = req.institute_code;
      address = req.address;
      created_at = Time.now();
    };
    admins.add(profileId, admin);
    admin;
  };

  public func getAdminByProfile(
    admins : AdminMap,
    profileId : Common.UserId,
  ) : ?AdminTypes.Admin {
    admins.get(profileId);
  };
};
