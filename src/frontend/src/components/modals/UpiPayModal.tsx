import { Button } from "@/components/ui/button";
import * as paymentService from "@/services/paymentService";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle, Copy, Wallet, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface UpiPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthKey: string;
  monthLabel: string;
  amountDue: number;
  studentId: string;
  adminId: string;
  onSuccess: () => void;
}

const UPI_ID = "8756646873@axl";
const PAYEE_NAME = "ANKIT";

export function UpiPayModal({
  isOpen,
  onClose,
  monthKey,
  monthLabel,
  amountDue,
  studentId,
  adminId,
  onSuccess,
}: UpiPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  async function handleConfirm() {
    setLoading(true);
    try {
      await paymentService.addPayment(adminId, {
        student_id: studentId,
        month: monthKey,
        amount_paid: amountDue,
        payment_method: "online",
        notes: "UPI Payment",
        payment_date: new Date().toISOString().split("T")[0],
      });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment recorded successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="upi-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="upi-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-elevated"
            style={{
              background: "oklch(var(--card) / 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(var(--border) / 0.3)",
            }}
            data-ocid="upi-pay.dialog"
          >
            {/* Purple accent top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-purple-400" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-fast"
              data-ocid="upi-pay.close_button"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-5 pb-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground text-lg leading-tight">
                    Pay Fee
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {monthLabel} —{" "}
                    <span className="font-semibold text-foreground">
                      ₹{amountDue.toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="p-2 rounded-2xl ring-4 ring-purple-500/40 bg-white shadow-soft">
                  <img
                    src="/assets/qr-upi.png"
                    alt="PhonePe QR Code"
                    width={200}
                    height={200}
                    className="rounded-xl block"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan the QR code or enter the UPI ID in any payment app
                </p>
              </div>

              {/* UPI ID Section */}
              <div
                className="rounded-xl border p-4 space-y-1"
                style={{ borderColor: "oklch(var(--border) / 0.4)" }}
              >
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  UPI ID
                </p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-mono text-base font-semibold text-foreground">
                    {UPI_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-fast shrink-0"
                    aria-label="Copy UPI ID"
                    data-ocid="upi-pay.copy_button"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pay to:{" "}
                  <span className="font-semibold text-foreground">
                    {PAYEE_NAME}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 transition-fast"
                  onClick={handleConfirm}
                  disabled={loading}
                  data-ocid="upi-pay.confirm_button"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />I have completed the
                      payment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                  disabled={loading}
                  data-ocid="upi-pay.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
