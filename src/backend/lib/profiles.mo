import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import ProfileTypes "../types/profiles";
import Common "../types/common";

module {
  public type ProfileMap = Map.Map<Text, ProfileTypes.Profile>;

  public func createProfile(
    profiles : ProfileMap,
    caller : Principal,
    req : ProfileTypes.CreateProfileRequest,
  ) : ProfileTypes.Profile {
    let userId = caller.toText();
    let now = Time.now();
    let profile : ProfileTypes.Profile = {
      id = userId;
      role = req.role;
      name = req.name;
      email = req.email;
      avatar_url = req.avatar_url;
      phone = req.phone;
      is_active = true;
      created_at = now;
      updated_at = now;
    };
    profiles.add(userId, profile);
    profile;
  };

  public func getProfile(
    profiles : ProfileMap,
    userId : Common.UserId,
  ) : ?ProfileTypes.Profile {
    profiles.get(userId);
  };

  public func updateProfile(
    profiles : ProfileMap,
    userId : Common.UserId,
    req : ProfileTypes.UpdateProfileRequest,
  ) : ?ProfileTypes.Profile {
    switch (profiles.get(userId)) {
      case null null;
      case (?existing) {
        let updated : ProfileTypes.Profile = {
          existing with
          name = switch (req.name) { case (?n) n; case null existing.name };
          email = switch (req.email) { case (?e) e; case null existing.email };
          avatar_url = switch (req.avatar_url) { case (?a) ?a; case null existing.avatar_url };
          phone = switch (req.phone) { case (?p) ?p; case null existing.phone };
          is_active = switch (req.is_active) { case (?a) a; case null existing.is_active };
          updated_at = Time.now();
        };
        profiles.add(userId, updated);
        ?updated;
      };
    };
  };
};
