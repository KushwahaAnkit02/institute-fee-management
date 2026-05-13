import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import AdminTypes "../types/admins";
import ProfileTypes "../types/profiles";
import Common "../types/common";
import AdminLib "../lib/admins";
import ProfileLib "../lib/profiles";

mixin (
  accessControlState : AccessControl.AccessControlState,
  admins : Map.Map<Text, AdminTypes.Admin>,
  profiles : Map.Map<Text, ProfileTypes.Profile>,
) {
  /// Create an admin record for the calling principal (must have admin role in profile).
  public shared ({ caller }) func createAdmin(
    req : AdminTypes.CreateAdminRequest
  ) : async AdminTypes.Admin {
    let userId = caller.toText();
    // Verify that this caller has an admin profile
    switch (ProfileLib.getProfile(profiles, userId)) {
      case null Runtime.trap("No profile found. Please create a profile first");
      case (?p) {
        switch (p.role) {
          case (#admin) {};
          case (#student) Runtime.trap("Only admins can create admin records");
        };
      };
    };
    // Prevent duplicate admin record
    switch (AdminLib.getAdminByProfile(admins, userId)) {
      case (?_) Runtime.trap("Admin record already exists for this principal");
      case null {};
    };
    AdminLib.createAdmin(admins, userId, req);
  };

  /// Return the admin record for the calling principal.
  public query ({ caller }) func getAdminByProfile() : async ?AdminTypes.Admin {
    AdminLib.getAdminByProfile(admins, caller.toText());
  };
};
