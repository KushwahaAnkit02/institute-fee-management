import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { AdminRecord, Profile, Role } from "@/types/auth";
import type { Student } from "@/types/student";
import type { AuthError, Session, User } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Admin signup
// ---------------------------------------------------------------------------
export async function signUpAdmin(
  email: string,
  password: string,
  name: string,
  instituteName: string,
  instituteCode: string,
): Promise<{ user: User; profile: Profile; admin: AdminRecord }> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { name, role: "admin" },
    },
  });

  if (signUpError) {
    if (
      signUpError.message.includes("already registered") ||
      signUpError.message.includes("already been registered") ||
      (signUpError as AuthError & { code?: string }).code === "email_taken"
    ) {
      throw new Error("AUTH_ALREADY_REGISTERED");
    }
    throw signUpError;
  }

  if (!authData.user) throw new Error("Signup failed — no user returned");

  const userId = authData.user.id;
  const code =
    instituteCode.trim() || `AC${Date.now().toString(36).toUpperCase()}`;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      role: "admin" as const,
      name,
      email,
      is_active: true,
      provider: "email" as const,
      avatar_url: null,
      phone: null,
      must_change_password: false,
      temp_password: false,
    } as TablesInsert<"profiles">)
    .select()
    .maybeSingle();

  if (profileError || !profileData) {
    await supabase.auth.signOut();
    throw new Error(
      `Failed to create profile: ${profileError?.message ?? "unknown"}`,
    );
  }

  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .insert({
      profile_id: userId,
      institute_name: instituteName.trim() || "Akshay Classes",
      institute_code: code,
      address: null,
    } as TablesInsert<"admins">)
    .select()
    .maybeSingle();

  if (adminError || !adminData) {
    throw new Error(
      `Failed to create admin record: ${adminError?.message ?? "unknown"}`,
    );
  }

  if (!authData.session) {
    throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
  }

  return {
    user: authData.user,
    profile: profileData as Profile,
    admin: adminData as AdminRecord,
  };
}

// ---------------------------------------------------------------------------
// Email login
// ---------------------------------------------------------------------------
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
    }
    throw error;
  }

  if (!data.session) throw new Error("Login failed — no session returned");
  return data.session;
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// OAuth callback
// ---------------------------------------------------------------------------
export async function handleOAuthCallback(): Promise<Session | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function logout(): Promise<void> {
  localStorage.removeItem("auth_intended_role");
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------
export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as Profile | null;
}

export async function getAdminRecord(
  profileId: string,
): Promise<AdminRecord | null> {
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  return data as AdminRecord | null;
}

// ---------------------------------------------------------------------------
// Student helpers
// ---------------------------------------------------------------------------
export async function checkStudentByEmail(
  email: string,
): Promise<Student | null> {
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  return data as Student | null;
}

export async function verifyStudentTempPassword(
  email: string,
  tempPassword: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("students")
    .select("temp_password")
    .eq("email", email)
    .maybeSingle();
  if (!data) return false;
  return (
    (data as { temp_password: string | null }).temp_password === tempPassword
  );
}

export async function createStudentAuthAccount(
  email: string,
  password: string,
): Promise<User> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Account creation failed");
  return data.user;
}

export async function linkStudentProfile(
  studentId: string,
  userId: string,
  studentFullName: string,
  studentEmail: string,
): Promise<void> {
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "student" as const,
    name: studentFullName,
    email: studentEmail,
    is_active: true,
    provider: "email" as const,
    avatar_url: null,
    phone: null,
    must_change_password: true,
    temp_password: false,
  } as TablesInsert<"profiles">);
  if (profileError)
    throw new Error(`Failed to create profile: ${profileError.message}`);

  const { error: linkError } = await supabase
    .from("students")
    .update({
      profile_id: userId,
      must_change_password: false,
      temp_password: null,
    } as TablesUpdate<"students">)
    .eq("id", studentId);
  if (linkError)
    throw new Error(`Failed to link student: ${linkError.message}`);
}

// ---------------------------------------------------------------------------
// Password management
// ---------------------------------------------------------------------------
export async function forgotPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Student login with temp password (first-login creates auth account)
// ---------------------------------------------------------------------------
export async function studentLoginWithTempPassword(
  email: string,
  password: string,
): Promise<{ session: Session; mustChangePassword: boolean }> {
  // Step 1: Try normal sign-in first (handles returning students with existing accounts)
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (!signInError && signInData.session) {
    // Existing account — load profile to check mustChangePassword
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", signInData.session.user.id)
      .maybeSingle();
    const mustChange =
      (profileRow as { must_change_password: boolean } | null)
        ?.must_change_password ?? false;
    return { session: signInData.session, mustChangePassword: mustChange };
  }

  // Step 2: Sign-in failed — try signing up (first-time login with temp password)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });

  if (signUpError) {
    // "User already registered" means account exists but password is wrong
    if (
      signUpError.message.includes("already registered") ||
      signUpError.message.includes("already been registered") ||
      (signUpError as AuthError & { code?: string }).code === "email_taken"
    ) {
      throw new Error("AUTH_INVALID_STUDENT_CREDENTIALS");
    }
    throw new Error("AUTH_INVALID_STUDENT_CREDENTIALS");
  }

  // No session after signUp means email confirmation is required
  if (!signUpData.session || !signUpData.user) {
    throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
  }

  const userId = signUpData.user.id;
  const session = signUpData.session;

  // Step 3: New account created — verify it's a valid student (check students table)
  const { data: studentRow } = await supabase
    .from("students")
    .select(
      "id, full_name, email, temp_password, profile_id, must_change_password",
    )
    .eq("email", email)
    .is("profile_id", null)
    .maybeSingle();

  if (!studentRow) {
    // No student record found — not registered by admin or already linked
    await supabase.auth.signOut();
    throw new Error("AUTH_STUDENT_NOT_REGISTERED");
  }

  const student = studentRow as {
    id: string;
    full_name: string;
    email: string;
    temp_password: string | null;
    profile_id: string | null;
    must_change_password: boolean;
  };

  // Verify the supplied password matches the stored temp_password
  if (student.temp_password !== password) {
    await supabase.auth.signOut();
    throw new Error("AUTH_INVALID_STUDENT_CREDENTIALS");
  }

  // Step 4: Create profile row for the new student
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "student" as const,
    name: student.full_name,
    email: student.email,
    is_active: true,
    provider: "email" as const,
    avatar_url: null,
    phone: null,
    must_change_password: true,
    temp_password: false,
  } as TablesInsert<"profiles">);

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(
      `Failed to create student profile: ${profileError.message}`,
    );
  }

  // Step 5: Link the student row to the new auth account
  await supabase
    .from("students")
    .update({ profile_id: userId } as TablesUpdate<"students">)
    .eq("id", student.id);

  return { session, mustChangePassword: true };
}

// ---------------------------------------------------------------------------
// Error message mapper
// ---------------------------------------------------------------------------
export function getAuthErrorMessage(error: AuthError | Error): string {
  const code =
    (error as AuthError & { code?: string }).code ?? error.message ?? "";

  const map: Record<string, string> = {
    invalid_credentials: "Invalid email or password. Please try again.",
    email_taken: "This email is already registered. Please sign in.",
    "23505": "This email is already registered. Please sign in.",
    over_email_send_rate_limit:
      "Too many attempts. Please wait a moment before trying again.",
    AUTH_ALREADY_REGISTERED:
      "This email is already registered. Please sign in.",
    AUTH_GOOGLE_ACCOUNT:
      "This account uses Google Sign In. Please continue with Google.",
    AUTH_EMAIL_IS_GOOGLE:
      "This email is connected with Google authentication. Use Google Sign In.",
    AUTH_GOOGLE_BUT_EMAIL_ACCOUNT:
      "This account was created using email/password. Please login using password.",
    AUTH_ROLE_MISMATCH_STUDENT:
      "You are registered as a student account. Please select correct role.",
    AUTH_ROLE_MISMATCH_ADMIN:
      "You are registered as an admin account. Please select correct role.",
    AUTH_STUDENT_NOT_REGISTERED: "You are not registered by the institute yet.",
    AUTH_EMAIL_VERIFICATION_REQUIRED:
      "Please verify your email before logging in.",
    AUTH_INVALID_CALLBACK: "Invalid authentication callback. Please try again.",
    AUTH_NOT_FOUND: "No account found with this email. Please sign up first.",
    AUTH_INVALID_STUDENT_CREDENTIALS:
      "Invalid email or password. Please check your credentials.",
  };

  return (
    map[code] ?? map[error.message] ?? "An error occurred. Please try again."
  );
}

// ---------------------------------------------------------------------------
// Legacy helpers kept for backward compat (OAuth callback handler)
// ---------------------------------------------------------------------------
export async function handleOAuthCallbackFull(): Promise<{
  user: User;
  profile: Profile | null;
  admin: AdminRecord | null;
  intendedRole: Role;
}> {
  const session = await handleOAuthCallback();
  if (!session) throw new Error("AUTH_INVALID_CALLBACK");

  const userId = session.user.id;
  const email = session.user.email!;
  const googleName =
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.name ??
    email.split("@")[0];
  const avatar_url = session.user.user_metadata?.avatar_url ?? null;
  const intendedRole =
    (localStorage.getItem("auth_intended_role") as Role | null) ?? "student";
  localStorage.removeItem("auth_intended_role");

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    const p = existingProfile as Profile;
    if (p.provider === "email") {
      await supabase.auth.signOut();
      throw new Error("AUTH_GOOGLE_BUT_EMAIL_ACCOUNT");
    }
    if (p.role !== intendedRole) {
      await supabase.auth.signOut();
      throw new Error(
        p.role === "student"
          ? "AUTH_ROLE_MISMATCH_STUDENT"
          : "AUTH_ROLE_MISMATCH_ADMIN",
      );
    }
    const admin = p.role === "admin" ? await getAdminRecord(userId) : null;
    return { user: session.user, profile: p, admin, intendedRole };
  }

  // New Google user — admin path
  if (intendedRole === "admin") {
    await supabase.from("profiles").insert({
      id: userId,
      role: "admin" as const,
      name: googleName,
      email,
      avatar_url,
      is_active: true,
      provider: "google" as const,
      phone: null,
      must_change_password: false,
      temp_password: false,
    } as TablesInsert<"profiles">);
    const code = `AC${Date.now().toString(36).toUpperCase()}`;
    await supabase.from("admins").insert({
      profile_id: userId,
      institute_name: "Akshay Classes",
      institute_code: code,
      address: null,
    } as TablesInsert<"admins">);
    const profile = await getProfileById(userId);
    const admin = await getAdminRecord(userId);
    return { user: session.user, profile, admin, intendedRole };
  }

  // New Google user — student path
  const { data: studentRecord } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .is("profile_id", null)
    .maybeSingle();

  if (!studentRecord) {
    await supabase.auth.signOut();
    throw new Error("AUTH_STUDENT_NOT_REGISTERED");
  }

  await supabase.from("profiles").insert({
    id: userId,
    role: "student" as const,
    name: (studentRecord as { full_name: string }).full_name,
    email,
    avatar_url,
    is_active: true,
    provider: "google" as const,
    phone: null,
    must_change_password: false,
    temp_password: false,
  } as TablesInsert<"profiles">);
  await supabase
    .from("students")
    .update({ profile_id: userId } as TablesUpdate<"students">)
    .eq("id", (studentRecord as { id: string }).id);

  const profile = await getProfileById(userId);
  return { user: session.user, profile, admin: null, intendedRole };
}
