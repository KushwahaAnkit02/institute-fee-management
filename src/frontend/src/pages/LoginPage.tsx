import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/useTheme";
import {
  getAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  resendVerificationEmail,
  signUpAdmin,
  studentLoginWithTempPassword,
} from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiGoogle } from "react-icons/si";

type TabMode = "signin" | "signup" | "forgot";

interface VerifyState {
  email: string;
  resent: boolean;
  resending: boolean;
}

interface ForgotState {
  email: string;
  sent: boolean;
  sending: boolean;
  error: string | null;
}

export function LoginPage() {
  const [tab, setTab] = useState<TabMode>("signin");
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [instituteCode, setInstituteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState | null>(null);
  const [forgotState, setForgotState] = useState<ForgotState>({
    email: "",
    sent: false,
    sending: false,
    error: null,
  });

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Read ?role= query param and pre-select tab
  const search = useSearch({ strict: false }) as { role?: string };
  useEffect(() => {
    if (search?.role === "admin" || search?.role === "student") {
      setSelectedRole(search.role as Role);
    }
  }, [search?.role]);

  const profile = useAuthStore((s) => s.profile);
  if (isAuthenticated && profile) {
    navigate({
      to: profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      replace: true,
    });
    return null;
  }

  function parseErrorCode(err: Error): string {
    const msg = err.message;
    // Strip the email suffix for the error key lookup
    const code = msg.includes(":") ? msg.split(":")[0] : msg;
    return getAuthErrorMessage(new Error(code));
  }

  function extractVerifyEmail(err: Error): string | null {
    if (err.message.startsWith("AUTH_EMAIL_VERIFICATION_REQUIRED:")) {
      return err.message.split(":")[1];
    }
    return null;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      if (selectedRole === "student") {
        // Student login — uses temp-password flow that creates auth account on first login
        const { mustChangePassword } = await studentLoginWithTempPassword(
          email.trim(),
          password,
        );
        await useAuthStore.getState().refreshUser();
        if (mustChangePassword) {
          navigate({ to: "/student/change-password", replace: true });
        } else {
          navigate({ to: "/student/dashboard", replace: true });
        }
      } else {
        // Admin login — standard email + password
        await loginWithEmail(email.trim(), password);
        await useAuthStore.getState().refreshUser();
        const profile = useAuthStore.getState().profile;
        if (profile?.role !== "admin") {
          setError(
            "This account is not registered as an admin. Please select the correct role.",
          );
          await useAuthStore.getState().logout();
          return;
        }
        navigate({ to: "/admin/dashboard", replace: true });
      }
    } catch (err) {
      const e = err as Error;
      const verifyEmail = extractVerifyEmail(e);
      if (verifyEmail) {
        setVerifyState({ email: verifyEmail, resent: false, resending: false });
        return;
      }
      // Map student-specific error codes
      if (
        e.message === "AUTH_INVALID_STUDENT_CREDENTIALS" ||
        e.message === "AUTH_STUDENT_NOT_REGISTERED"
      ) {
        setError(
          e.message === "AUTH_STUDENT_NOT_REGISTERED"
            ? "You are not registered by the institute. Please contact your admin."
            : "Invalid email or password. Please check your credentials.",
        );
        return;
      }
      setError(parseErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Students cannot sign up publicly
    if (selectedRole === "student") {
      setError(
        "Student accounts are created by your institute admin. Please contact your admin for login credentials.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpAdmin(
        email.trim(),
        password,
        name.trim(),
        instituteName.trim(),
        instituteCode.trim(),
      );
      await useAuthStore.getState().refreshUser();
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      const e = err as Error;
      const verifyEmail = extractVerifyEmail(e);
      if (verifyEmail) {
        setVerifyState({ email: verifyEmail, resent: false, resending: false });
        return;
      }
      setError(parseErrorCode(e));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // redirect handled by Supabase OAuth
    } catch (err) {
      setError(parseErrorCode(err as Error));
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotState.email) return;
    setForgotState((s) => ({ ...s, sending: true, error: null }));
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotState.email.trim(),
        { redirectTo: `${window.location.origin}/auth/callback?type=recovery` },
      );
      if (resetError) throw resetError;
      setForgotState((s) => ({ ...s, sent: true, sending: false }));
    } catch (err) {
      setForgotState((s) => ({
        ...s,
        sending: false,
        error: (err as Error).message || "Failed to send reset email.",
      }));
    }
  }

  async function handleResend() {
    if (!verifyState) return;
    setVerifyState((v) => v && { ...v, resending: true });
    try {
      await resendVerificationEmail(verifyState.email);
      setVerifyState((v) => v && { ...v, resent: true, resending: false });
    } catch {
      setVerifyState((v) => v && { ...v, resending: false });
    }
  }

  // --- Email verification pending UI ---
  if (verifyState) {
    return (
      <PageShell theme={theme} toggleTheme={toggleTheme}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="glass-card rounded-3xl p-10 shadow-elevated w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Check your inbox
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            We sent a verification link to
          </p>
          <p className="font-semibold text-foreground mb-6">
            {verifyState.email}
          </p>
          <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
            Click the link in the email to activate your account. Check your
            spam folder if you don't see it within a minute.
          </p>

          <AnimatePresence>
            {verifyState.resent && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-sm mb-4"
                style={{ color: "oklch(0.62 0.2 155)" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification email resent!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={verifyState.resending || verifyState.resent}
              onClick={handleResend}
              data-ocid="verify.resend_button"
            >
              {verifyState.resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </span>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setVerifyState(null)}
              data-ocid="verify.back_button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          </div>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell theme={theme} toggleTheme={toggleTheme}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.34, 1.2, 0.64, 1] }}
        className="glass-card rounded-3xl shadow-elevated w-full max-w-md overflow-hidden"
      >
        {/* Gradient top bar */}
        <div className="h-1 gradient-accent" />

        <div className="p-8">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-7">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="w-16 h-16 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center mb-4 relative"
            >
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
              </div>
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Akshay Classes
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Fee Management Portal
            </p>
          </div>

          {/* Tabs: Sign In / Sign Up */}
          <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                data-ocid={`login.tab.${t}`}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-fast ${
                  tab === t
                    ? "bg-background shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Role Selector */}
          <div className="mb-5">
            <p className="text-[10px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">
              Select role
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  {
                    role: "admin" as Role,
                    icon: Shield,
                    label: "Admin",
                    sub: "Institute staff",
                  },
                  {
                    role: "student" as Role,
                    icon: Users,
                    label: "Student",
                    sub: "Enrolled student",
                  },
                ] as const
              ).map(({ role, icon: Icon, label, sub }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setError(null);
                  }}
                  data-ocid={`login.role.${role}`}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-fast cursor-pointer text-left ${
                    selectedRole === role
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === role ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">
                      {label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 flex items-center gap-2.5 h-11 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-fast"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            data-ocid="login.google_button"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SiGoogle className="w-4 h-4" />
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[11px] text-muted-foreground font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-destructive leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email address</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="login.email_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setForgotState({
                          email,
                          sent: false,
                          sending: false,
                          error: null,
                        });
                      }}
                      className="text-xs text-primary hover:text-primary/80 transition-fast font-medium"
                      data-ocid="login.forgot_password_link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="login.password_input"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold h-11"
                  disabled={isSubmitting}
                  data-ocid="login.submit_button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.form>
            ) : tab === "signup" ? (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSignUp}
                className="space-y-3.5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="signup.name_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="signup.email_input"
                  />
                </div>
                {selectedRole === "admin" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-institute">Institute Name</Label>
                      <Input
                        id="signup-institute"
                        type="text"
                        placeholder="e.g. Akshay Classes"
                        value={instituteName}
                        onChange={(e) => setInstituteName(e.target.value)}
                        className="bg-muted/30 h-11"
                        data-ocid="signup.institute_name_input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-code">
                        Institute Code{" "}
                        <span className="text-muted-foreground font-normal text-xs">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="signup-code"
                        type="text"
                        placeholder="Auto-generated if blank"
                        value={instituteCode}
                        onChange={(e) => setInstituteCode(e.target.value)}
                        className="bg-muted/30 h-11"
                        data-ocid="signup.institute_code_input"
                      />
                    </div>
                  </>
                )}
                {selectedRole === "student" && (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Note:</span>{" "}
                    Your email must be pre-registered by the institute admin
                    before you can sign up.
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="signup.password_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-muted/30 h-11"
                    data-ocid="signup.confirm_input"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold h-11"
                  disabled={isSubmitting}
                  data-ocid="signup.submit_button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.form>
            ) : (
              /* Forgot Password form */
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                {forgotState.sent ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">
                      Check your inbox
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      We sent a password reset link to{" "}
                      <span className="font-medium text-foreground">
                        {forgotState.email}
                      </span>
                      . Check your spam folder if you don't see it.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setTab("signin");
                        setForgotState({
                          email: "",
                          sent: false,
                          sending: false,
                          error: null,
                        });
                      }}
                      data-ocid="forgot.back_button"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="mb-1">
                      <h3 className="font-display font-bold text-foreground text-lg mb-1">
                        Reset password
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        We'll send a reset link to your email.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="forgot-email">Email address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotState.email}
                        onChange={(e) =>
                          setForgotState((s) => ({
                            ...s,
                            email: e.target.value,
                          }))
                        }
                        required
                        className="bg-muted/30 h-11"
                        data-ocid="forgot.email_input"
                      />
                    </div>
                    {forgotState.error && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {forgotState.error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold h-11"
                      disabled={forgotState.sending}
                      data-ocid="forgot.submit_button"
                    >
                      {forgotState.sending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => setTab("signin")}
                      data-ocid="forgot.back_button"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </PageShell>
  );
}

// --- Shared page shell ---
function PageShell({
  children,
  theme,
  toggleTheme,
}: {
  children: React.ReactNode;
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shadow-soft">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">
                Akshay Classes
              </p>
              <p className="text-[10px] text-muted-foreground">
                Fee Management Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast text-muted-foreground"
            data-ocid="login.theme_toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 rounded-full bg-primary/4 blur-2xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer hint */}
      <div className="text-center py-4 text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} Akshay Classes. Secure portal.
      </div>
    </div>
  );
}
