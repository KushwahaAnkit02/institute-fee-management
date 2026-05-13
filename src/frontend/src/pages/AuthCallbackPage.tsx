import { Button } from "@/components/ui/button";
import {
  getAuthErrorMessage,
  handleOAuthCallback,
} from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function processCallback() {
      try {
        const authUser = await handleOAuthCallback();
        if (cancelled) return;
        login(authUser);
        navigate({
          to:
            authUser.role === "admin"
              ? "/admin/dashboard"
              : "/student/dashboard",
        });
      } catch (err) {
        if (cancelled) return;
        const e = err as Error;
        const code = e.message.includes(":")
          ? e.message.split(":")[0]
          : e.message;
        setError(getAuthErrorMessage(code));
      }
    }

    processCallback();
    return () => {
      cancelled = true;
    };
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 shadow-elevated w-full max-w-md text-center"
          data-ocid="auth_callback.error_state"
        >
          <div className="w-16 h-16 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h2 className="font-display text-lg font-bold text-destructive">
              Sign In Failed
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate({ to: "/login" })}
            data-ocid="auth_callback.back_button"
          >
            ← Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"
      data-ocid="auth_callback.loading_state"
    >
      <div className="w-14 h-14 rounded-2xl gradient-accent shadow-elevated flex items-center justify-center">
        <GraduationCap className="w-7 h-7 text-primary-foreground" />
      </div>
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">
        Completing sign in...
      </p>
    </div>
  );
}
