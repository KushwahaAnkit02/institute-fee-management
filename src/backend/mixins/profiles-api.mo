import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProfileTypes "../types/profiles";
import StudentTypes "../types/students";
import Common "../types/common";
import ProfileLib "../lib/profiles";
import StudentLib "../lib/students";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Text, ProfileTypes.Profile>,
  students : Map.Map<Text, StudentTypes.Student>,
) {
  /// Create a profile for the calling principal (first-time registration).
  /// If role=student, auto-links to a pre-created student record by email.
  public shared ({ caller }) func createProfile(
    req : ProfileTypes.CreateProfileRequest
  ) : async ProfileTypes.Profile {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot create profiles");
    };
    let userId = caller.toText();
    // Prevent duplicate profile
    switch (ProfileLib.getProfile(profiles, userId)) {
      case (?_) Runtime.trap("Profile already exists for this principal");
      case null {};
    };
    // For student role: verify admin pre-created a student record with this email
    switch (req.role) {
      case (#student) {
        switch (StudentLib.findStudentByEmail(students, req.email)) {
          case null Runtime.trap("You are not registered by the institute yet");
          case (?s) {
            let profile = ProfileLib.createProfile(profiles, caller, req);
            // Auto-link student record to this profile
            ignore StudentLib.linkStudentProfile(students, s.id, userId);
            profile;
          };
        };
      };
      case (#admin) {
        ProfileLib.createProfile(profiles, caller, req);
      };
    };
  };

  /// Return the profile of the calling principal.
  public query ({ caller }) func getMyProfile() : async ?ProfileTypes.Profile {
    ProfileLib.getProfile(profiles, caller.toText());
  };

  /// Update the profile of the calling principal.
  public shared ({ caller }) func updateProfile(
    req : ProfileTypes.UpdateProfileRequest
  ) : async ?ProfileTypes.Profile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ProfileLib.updateProfile(profiles, caller.toText(), req);
  };
};
