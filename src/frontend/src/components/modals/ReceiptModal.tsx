import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Payment } from "@/types/payment";
import type { Student } from "@/types/student";
import { formatDate, formatMonth } from "@/utils/formatters";
import { BookOpen, Building2, Printer } from "lucide-react";

interface ReceiptModalProps {
  payment: Payment;
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  online: "Online / UPI",
  cheque: "Cheque",
  card: "Card",
};

export function ReceiptModal({
  payment,
  student,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  const receiptNo = `RCPT-${payment.id.slice(0, 8).toUpperCase()}`;

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Print styles — hidden from screen, visible on print */}
      <style>{`
        @media print {
          body > *:not(.receipt-print-root) { display: none !important; }
          .receipt-print-root { display: block !important; position: static !important; }
          .receipt-no-print { display: none !important; }
          .receipt-printable {
            display: block !important;
            position: static !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden"
          data-ocid="receipt.dialog"
        >
          {/* Printable area */}
          <div className="receipt-printable p-6 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Akshay Classes
              </h1>
              <p className="text-xs text-muted-foreground">
                Fee Management Portal
              </p>
              <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Fee Receipt
              </div>
            </div>

            {/* Receipt No + Date */}
            <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-muted/40">
              <div>
                <p className="text-[11px] text-muted-foreground">Receipt No.</p>
                <p className="text-sm font-mono font-semibold text-foreground">
                  {receiptNo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Student Info */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Student Details
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground">
                    {student.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Class</p>
                  <p className="font-medium text-foreground">
                    {student.class_id ?? "—"}
                  </p>
                </div>
                {student.enrollment_no && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Enrollment No.
                    </p>
                    <p className="font-medium text-foreground font-mono">
                      {student.enrollment_no}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Payment Details
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Fee Month</p>
                  <p className="font-medium text-foreground">
                    {formatMonth(payment.month)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium text-foreground capitalize">
                    {METHOD_LABELS[payment.payment_method] ??
                      payment.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Paid On</p>
                  <p className="font-medium text-foreground">
                    {formatDate(payment.payment_date)}
                  </p>
                </div>
                {payment.notes && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Notes</p>
                    <p className="font-medium text-foreground">
                      {payment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Box */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="font-display text-2xl font-bold text-primary">
                  ₹{payment.amount_paid.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-semibold">
                  ✓ Paid
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-1">
              <Separator className="mb-3" />
              <p className="text-xs text-muted-foreground">
                Thank you for your payment!
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                This is a computer-generated receipt.
              </p>
            </div>

            {/* Print Button — hidden on print */}
            <div className="receipt-no-print">
              <Button
                type="button"
                onClick={handlePrint}
                className="w-full gap-2 gradient-accent text-primary-foreground"
                data-ocid="receipt.print_button"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
