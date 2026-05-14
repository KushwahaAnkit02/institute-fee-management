import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, CheckCircle2, Copy, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface CredentialModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  email: string;
  tempPassword: string;
}

function CopyField({
  label,
  value,
  ocid,
}: {
  label: string;
  value: string;
  ocid: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-xl border bg-muted/50 px-4 py-3">
        <span className="flex-1 font-mono text-sm font-medium text-foreground break-all">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast"
          aria-label={`Copy ${label}`}
          data-ocid={ocid}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export function CredentialModal({
  open,
  onClose,
  studentName,
  email,
  tempPassword,
}: CredentialModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          data-ocid="credential-modal.dialog"
        >
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                Student Added Successfully
              </DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-foreground">
                  {studentName}
                </span>{" "}
                has been added to the portal. Share the following login
                credentials with the student manually.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 space-y-4">
            <CopyField
              label="Login Email"
              value={email}
              ocid="credential-modal.copy_email_button"
            />
            <CopyField
              label="Temporary Password"
              value={tempPassword}
              ocid="credential-modal.copy_password_button"
            />

            {/* Warning box */}
            <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
              <TriangleAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  These credentials will not be shown again
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                  The student will be prompted to change their password on first
                  login. Make sure to share these now.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-2">
            <Button
              type="button"
              className="w-full"
              onClick={onClose}
              data-ocid="credential-modal.close_button"
            >
              Got it, I've shared the credentials
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
