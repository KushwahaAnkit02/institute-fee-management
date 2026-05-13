import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import ProfileTypes "types/profiles";
import AdminTypes "types/admins";
import StudentTypes "types/students";
import PaymentTypes "types/payments";
import NotifTypes "types/notifications";
import ProfilesApi "mixins/profiles-api";
import AdminsApi "mixins/admins-api";
import StudentsApi "mixins/students-api";
import PaymentsApi "mixins/payments-api";
import NotificationsApi "mixins/notifications-api";

actor {
  // --- Authorization state (manages Internet Identity roles) ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Domain state maps (key = record id as Text) ---
  let profiles = Map.empty<Text, ProfileTypes.Profile>();
  let admins = Map.empty<Text, AdminTypes.Admin>();
  let students = Map.empty<Text, StudentTypes.Student>();
  let payments = Map.empty<Text, PaymentTypes.MonthlyPayment>();
  let notifications = Map.empty<Text, NotifTypes.Notification>();

  // --- Mixin includes (delegate all public API) ---
  include ProfilesApi(accessControlState, profiles, students);
  include AdminsApi(accessControlState, admins, profiles);
  include StudentsApi(accessControlState, students, admins);
  include PaymentsApi(accessControlState, payments, students, admins, notifications);
  include NotificationsApi(accessControlState, notifications, admins, students);
};

