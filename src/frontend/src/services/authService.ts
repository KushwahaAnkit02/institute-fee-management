import { supabase } from "@/lib/supabase";
import type { AuthUser, Role, SignupCredentials } from "@/types/auth";

// =========================================
// HELPER: Build AuthUser from profile + related data
// =========================================
export async function buildAuthUser(userId: string): Promise<AuthUser | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  const authUser: AuthUser = {
    id: profile.id,
    email: profile.email,
    role: profile.role as Role,
    name: profile.name,
    avatar_url: profile.avatar_url,
    phone: profile.phone,
  };

  if (profile.role === "admin") {
    const { data: adminRecord } = await supabase
      .from("admins")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (adminRecord) {
      authUser.admin_id = adminRecord.id;
      authUser.institute_name = adminRecord.institute_name;
      authUser.institute_code = adminRecord.institute_code;
    }
  } else if (profile.role === "student") {
    const { data: studentRecord } = await supabase
      .from("students")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (studentRecord) {
      authUser.student_id = studentRecord.id;
      authUser.linked_admin_id = studentRecord.admin_id;
    }
  }

  return authUser;
}

// =========================================
// HELPER: Detect auth provider for an email
// =========================================
async function getEmailAuthProvider(
  email: string,
): Promise<"email" | "google" | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("provider")
    .eq("email", email)
    .maybeSingle();

  if (!profile) return null;
  return (profile as { provider: "email" | "google" }).provider;
}

// =========================================
// ADMIN SIGNUP
// =========================================
export async function signUpAdmin(
  credentials: SignupCredentials,
): Promise<AuthUser> {
  const { email, password, name, institute_name, institute_code, address } =
    credentials;

  const existingProvider = await getEmailAuthProvider(email);
  if (existingProvider === "email") throw new Error("AUTH_ALREADY_REGISTERED");
  if (existingProvider === "google") throw new Error("AUTH_GOOGLE_ACCOUNT");

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
      signUpError.message.includes("already been registered")
    ) {
      throw new Error("AUTH_ALREADY_REGISTERED");
    }
    throw signUpError;
  }

  if (!authData.user) throw new Error("Signup failed — no user returned");

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "admin" as const,
    name,
    email,
    is_active: true,
    provider: "email" as const,
    avatar_url: null,
    phone: null,
  });

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  const code = institute_code || `AC${Date.now().toString(36).toUpperCase()}`;
  const { error: adminError } = await supabase.from("admins").insert({
    profile_id: userId,
    institute_name: institute_name || "Akshay Classes",
    institute_code: code,
    address: address || null,
  });

  if (adminError) {
    throw new Error(`Failed to create admin record: ${adminError.message}`);
  }

  if (!authData.session) {
    throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
  }

  return (await buildAuthUser(userId)) as AuthUser;
}

// =========================================
// STUDENT SIGNUP — links to pre-existing student record
// =========================================
export async function signUpStudent(
  credentials: SignupCredentials,
): Promise<AuthUser> {
  const { email, password } = credentials;

  // 1. Check if student record exists and is unlinked
  const { data: studentRecord } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .is("profile_id", null)
    .maybeSingle();

  if (!studentRecord) {
    const { data: linkedStudent } = await supabase
      .from("students")
      .select("profile_id")
      .eq("email", email)
      .not("profile_id", "is", null)
      .maybeSingle();

    if (linkedStudent) throw new Error("AUTH_ALREADY_REGISTERED");
    throw new Error("AUTH_STUDENT_NOT_REGISTERED");
  }

  const existingProvider = await getEmailAuthProvider(email);
  if (existingProvider === "email") throw new Error("AUTH_ALREADY_REGISTERED");
  if (existingProvider === "google") throw new Error("AUTH_GOOGLE_ACCOUNT");

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { name: studentRecord.name, role: "student" },
    },
  });

  if (signUpError) {
    if (
      signUpError.message.includes("already registered") ||
      signUpError.message.includes("already been registered")
    ) {
      throw new Error("AUTH_ALREADY_REGISTERED");
    }
    throw signUpError;
  }

  if (!authData.user) throw new Error("Signup failed");

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: "student" as const,
    name: studentRecord.name,
    email,
    is_active: true,
    provider: "email" as const,
    avatar_url: null,
    phone: null,
  });

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  const { error: linkError } = await supabase
    .from("students")
    .update({ profile_id: userId })
    .eq("id", studentRecord.id);

  if (linkError) {
    throw new Error(`Failed to link student record: ${linkError.message}`);
  }

  if (!authData.session) {
    throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
  }

  return (await buildAuthUser(userId)) as AuthUser;
}

// =========================================
// EMAIL + PASSWORD LOGIN
// =========================================
export async function loginWithEmail(
  email: string,
  password: string,
  role: Role,
): Promise<AuthUser> {
  const existingProvider = await getEmailAuthProvider(email);

  if (existingProvider === "google") throw new Error("AUTH_EMAIL_IS_GOOGLE");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      throw new Error(`AUTH_EMAIL_VERIFICATION_REQUIRED:${email}`);
    }
    if (
      error.message.includes("Invalid login credentials") &&
      !existingProvider
    ) {
      throw new Error("AUTH_NOT_FOUND");
    }
    throw error;
  }

  if (!data.user) throw new Error("Login failed");

  const authUser = await buildAuthUser(data.user.id);
  if (!authUser) throw new Error("Profile not found");

  if (authUser.role !== role) {
    await supabase.auth.signOut();
    throw new Error(
      authUser.role === "student"
        ? "AUTH_ROLE_MISMATCH_STUDENT"
        : "AUTH_ROLE_MISMATCH_ADMIN",
    );
  }

  if (role === "student" && !authUser.student_id) {
    await supabase.auth.signOut();
    throw new Error("AUTH_STUDENT_NOT_REGISTERED");
  }

  return authUser;
}

// =========================================
// GOOGLE OAUTH SIGN IN
// =========================================
export async function loginWithGoogle(role: Role): Promise<void> {
  localStorage.setItem("auth_intended_role", role);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
}

// =========================================
// OAUTH CALLBACK HANDLER
// =========================================
export async function handleOAuthCallback(): Promise<AuthUser> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error("AUTH_INVALID_CALLBACK");
  }

  const userId = sessionData.session.user.id;
  const email = sessionData.session.user.email!;
  const googleName =
    sessionData.session.user.user_metadata?.full_name ||
    sessionData.session.user.user_metadata?.name ||
    email.split("@")[0];
  const avatar_url = sessionData.session.user.user_metadata?.avatar_url || null;

  const intendedRole =
    (localStorage.getItem("auth_intended_role") as Role) || "student";
  localStorage.removeItem("auth_intended_role");

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    if ((existingProfile as { provider: string }).provider === "email") {
      await supabase.auth.signOut();
      throw new Error("AUTH_GOOGLE_BUT_EMAIL_ACCOUNT");
    }
    if ((existingProfile as { role: string }).role !== intendedRole) {
      await supabase.auth.signOut();
      throw new Error(
        (existingProfile as { role: string }).role === "student"
          ? "AUTH_ROLE_MISMATCH_STUDENT"
          : "AUTH_ROLE_MISMATCH_ADMIN",
      );
    }
    return (await buildAuthUser(userId)) as AuthUser;
  }

  // New Google user
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
    });

    const code = `AC${Date.now().toString(36).toUpperCase()}`;
    await supabase.from("admins").insert({
      profile_id: userId,
      institute_name: "Akshay Classes",
      institute_code: code,
      address: null,
    });
  } else {
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
      name: studentRecord.name,
      email,
      avatar_url,
      is_active: true,
      provider: "google" as const,
      phone: null,
    });

    await supabase
      .from("students")
      .update({ profile_id: userId })
      .eq("id", studentRecord.id);
  }

  return (await buildAuthUser(userId)) as AuthUser;
}

// =========================================
// LOGOUT
// =========================================
export async function logout(): Promise<void> {
  localStorage.removeItem("auth_intended_role");
  await supabase.auth.signOut();
}

// =========================================
// GET CURRENT SESSION
// =========================================
export async function getCurrentSession(): Promise<AuthUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;
  return await buildAuthUser(sessionData.session.user.id);
}

// =========================================
// RESEND VERIFICATION EMAIL
// =========================================
export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

// =========================================
// ERROR MESSAGE MAPPER
// =========================================
export function getAuthErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
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
    AUTH_STALE_SESSION: "Your session has expired. Please sign in again.",
    AUTH_NOT_FOUND: "No account found with this email. Please sign up first.",
  };
  return messages[errorCode] ?? "Authentication failed. Please try again.";
}
