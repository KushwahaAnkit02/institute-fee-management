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
  signUpStudent,
} from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/auth";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Moon,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SiGoogle } from "react-icons/si";

type TabMode = "signin" | "signup";

interface VerifyState {
  email: string;
  resent: boolean;
  resending: boolean;
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

  const { login: storeLogin, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated && user) {
    navigate({
      to: user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
    });
    return null;
  }

  function parseErrorCode(err: Error): string {
    const msg = err.message;
    // Strip the email suffix for the error key lookup
    const code = msg.includes(":") ? msg.split(":")[0] : msg;
    return getAuthErrorMessage(code);
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
      const authUser = await loginWithEmail(
        email.trim(),
        password,
        selectedRole,
      );
      storeLogin(authUser);
      navigate({
        to:
          authUser.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      });
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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      if (selectedRole === "admin") {
        const authUser = await signUpAdmin({
          email: email.trim(),
          password,
          name: name.trim(),
          role: "admin",
          institute_name: instituteName.trim() || undefined,
          institute_code: instituteCode.trim() || undefined,
        });
        storeLogin(authUser);
        navigate({ to: "/admin/dashboard" });
      } else {
        const authUser = await signUpStudent({
          email: email.trim(),
          password,
          name: name.trim(),
          role: "student",
        });
        storeLogin(authUser);
        navigate({ to: "/student/dashboard" });
      }
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
      await loginWithGoogle(selectedRole);
      // redirect handled by Supabase OAuth
    } catch (err) {
      setError(parseErrorCode(err as Error));
      setGoogleLoading(false);
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
      <div className="min-h-screen bg-background flex flex-col">
        <LoginHeader theme={theme} toggleTheme={toggleTheme} />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-10 shadow-elevated w-full max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Verify your email
            </h2>
            <p className="text-muted-foreground text-sm mb-2">
              We sent a verification link to
            </p>
            <p className="font-semibold text-foreground mb-6">
              {verifyState.email}
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Click the link in the email to activate your account. Check your
              spam folder if you don't see it.
            </p>

            {verifyState.resent ? (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification email resent!</span>
              </div>
            ) : null}

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
                  "Resend Email"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setVerifyState(null)}
                data-ocid="verify.back_button"
              >
                ← Back to Login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoginHeader theme={theme} toggleTheme={toggleTheme} />

      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card rounded-3xl p-8 shadow-elevated"
          >
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-center text-foreground mb-1">
              Akshay Classes
            </h1>
            <p className="text-xs text-muted-foreground text-center mb-6">
              Fee Management Portal
            </p>

            {/* Tabs */}
            <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
              {(["signin", "signup"] as TabMode[]).map((t) => (
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
              <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wide">
                Select role
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-fast cursor-pointer ${
                      selectedRole === role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedRole === role ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
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
              className="w-full mb-4 flex items-center gap-2.5"
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
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In Form */}
            <AnimatePresence mode="wait">
              {tab === "signin" ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/30"
                      data-ocid="login.email_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-muted/30"
                      data-ocid="login.password_input"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold"
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
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
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
                      className="bg-muted/30"
                      data-ocid="signup.name_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/30"
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
                          className="bg-muted/30"
                          data-ocid="signup.institute_name_input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-code">
                          Institute Code{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="signup-code"
                          type="text"
                          placeholder="Auto-generated if blank"
                          value={instituteCode}
                          onChange={(e) => setInstituteCode(e.target.value)}
                          className="bg-muted/30"
                          data-ocid="signup.institute_code_input"
                        />
                      </div>
                    </>
                  )}
                  {selectedRole === "student" && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/30 text-xs text-muted-foreground">
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
                      className="bg-muted/30"
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
                      className="bg-muted/30"
                      data-ocid="signup.confirm_input"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold"
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
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoginHeader({
  theme,
  toggleTheme,
}: {
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <header className="glass-header">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sm">Akshay Classes</p>
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
  );
}
