import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/useTheme";
import { forgotPassword } from "@/services/authService";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

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
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.34, 1.2, 0.64, 1] }}
            className="glass-card rounded-3xl shadow-elevated overflow-hidden"
          >
            <div className="h-1 gradient-accent" />
            <div className="p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4"
                  data-ocid="forgot-password.success_state"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    We sent a password reset link to
                  </p>
                  <p className="font-semibold text-foreground mb-6">{email}</p>
                  <p className="text-xs text-muted-foreground mb-8 leading-relaxed">
                    Click the link in the email to reset your password. Check
                    your spam folder if you don&apos;t see it within a minute.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate({ to: "/login" })}
                    data-ocid="forgot-password.back_button"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Icon & heading */}
                  <div className="flex flex-col items-center mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      Forgot password?
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Enter your email and we&apos;ll send a reset link.
                    </p>
                  </div>

                  {error && (
                    <div
                      className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                      data-ocid="forgot-password.error_state"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fp-email">Email address</Label>
                      <Input
                        id="fp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-muted/30 h-11"
                        data-ocid="forgot-password.email_input"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-accent text-primary-foreground shadow-soft font-semibold h-11"
                      disabled={loading}
                      data-ocid="forgot-password.submit_button"
                    >
                      {loading ? (
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
                      onClick={() => navigate({ to: "/login" })}
                      data-ocid="forgot-password.back_button"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="text-center py-4 text-[11px] text-muted-foreground">
        &copy; {new Date().getFullYear()} Akshay Classes. Secure portal.
      </div>
    </div>
  );
}
