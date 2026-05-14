import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Resolver, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

function buildSchema(requireCurrent: boolean) {
  return z
    .object({
      current_password: requireCurrent
        ? z.string().min(1, "Current password is required")
        : z.string().optional(),
      new_password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
      confirm_password: z.string().min(1, "Please confirm your password"),
    })
    .refine((d) => d.new_password === d.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    });
}

type ChangePasswordFormValues = {
  current_password?: string;
  new_password: string;
  confirm_password: string;
};

function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

const STRENGTH_LABELS = [
  "Very Weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
  "Very Strong",
];
const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-emerald-600",
];

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  required?: boolean;
}

export function ChangePasswordModal({
  open,
  onClose,
  onSuccess,
  required = false,
}: ChangePasswordModalProps) {
  const requireCurrent = !required;
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      buildSchema(requireCurrent),
    ) as Resolver<ChangePasswordFormValues>,
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password") ?? "";
  const strength = getStrength(newPassword);

  function handleClose() {
    if (required) return;
    reset();
    setServerError("");
    onClose();
  }

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true);
    setServerError("");
    try {
      if (requireCurrent && values.current_password) {
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user.email;
        if (!email) throw new Error("Session not found.");
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email,
          password: values.current_password,
        });
        if (reAuthError) {
          setServerError("Current password is incorrect.");
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: values.new_password,
      });
      if (error) throw error;

      reset();
      onSuccess();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !required) handleClose();
      }}
    >
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto p-0"
        onInteractOutside={(e) => required && e.preventDefault()}
        onEscapeKeyDown={(e) => required && e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary to-accent rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                {required ? (
                  <ShieldCheck className="w-5 h-5 text-primary" />
                ) : (
                  <KeyRound className="w-5 h-5 text-primary" />
                )}
                {required ? "Set New Password" : "Change Password"}
              </DialogTitle>
              <DialogDescription>
                {required
                  ? "This is your first login. Please set a new secure password before continuing."
                  : "Enter your current password and a new password below."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit(
              onSubmit as SubmitHandler<ChangePasswordFormValues>,
            )}
          >
            <div className="px-6 py-4 space-y-4">
              {serverError && (
                <div
                  className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
                  data-ocid="change-password-modal.error_state"
                >
                  {serverError}
                </div>
              )}

              {requireCurrent && (
                <div className="space-y-1.5">
                  <Label htmlFor="current_password">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Your current password"
                      disabled={isLoading}
                      {...register("current_password")}
                      className={cn(
                        "pr-10",
                        errors.current_password && "border-destructive",
                      )}
                      data-ocid="change-password-modal.current_password_input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                      aria-label="Toggle current password visibility"
                    >
                      {showCurrent ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.current_password && (
                    <p className="text-xs text-destructive">
                      {errors.current_password.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new_password">New Password *</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNew ? "text" : "password"}
                    placeholder="At least 8 characters"
                    disabled={isLoading}
                    {...register("new_password")}
                    className={cn(
                      "pr-10",
                      errors.new_password && "border-destructive",
                    )}
                    data-ocid="change-password-modal.new_password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                    aria-label="Toggle new password visibility"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-xs text-destructive">
                    {errors.new_password.message}
                  </p>
                )}
                {/* Strength indicator */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {["s0", "s1", "s2", "s3", "s4"].map((id, i) => (
                        <div
                          key={id}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < strength
                              ? STRENGTH_COLORS[Math.min(strength, 5)]
                              : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Strength:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          strength >= 4
                            ? "text-green-600 dark:text-green-400"
                            : strength >= 2
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-destructive",
                        )}
                      >
                        {STRENGTH_LABELS[Math.min(strength, 5)]}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    disabled={isLoading}
                    {...register("confirm_password")}
                    className={cn(
                      "pr-10",
                      errors.confirm_password && "border-destructive",
                    )}
                    data-ocid="change-password-modal.confirm_password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="change-password-modal.confirm_password_error"
                  >
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              {!required && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  data-ocid="change-password-modal.cancel_button"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="change-password-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
