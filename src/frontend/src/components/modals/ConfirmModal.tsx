import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isLoading && onClose()}>
      <DialogContent className="max-w-sm p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className={`h-1 w-full rounded-t-lg ${
              isDanger
                ? "bg-gradient-to-r from-destructive to-red-400"
                : "bg-gradient-to-r from-primary to-accent"
            }`}
          />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-display">
                {isDanger && (
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                )}
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {message}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-ocid="confirm-modal.cancel_button"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              variant={isDanger ? "destructive" : "default"}
              data-ocid="confirm-modal.confirm_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Please
                  wait...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
