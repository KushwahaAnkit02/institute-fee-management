import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            data-ocid="confirm.dialog"
          >
            <div className="glass-card rounded-2xl p-6 shadow-elevated">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    variant === "danger"
                      ? "bg-destructive/15"
                      : "bg-amber-500/15"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      variant === "danger"
                        ? "text-destructive"
                        : "text-amber-500"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-muted-foreground hover:text-foreground transition-fast"
                  data-ocid="confirm.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {description}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                  data-ocid="confirm.cancel_button"
                >
                  {cancelLabel}
                </Button>
                <Button
                  className={`flex-1 ${
                    variant === "danger"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : "gradient-accent text-primary-foreground"
                  }`}
                  onClick={onConfirm}
                  disabled={isLoading}
                  data-ocid="confirm.confirm_button"
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
