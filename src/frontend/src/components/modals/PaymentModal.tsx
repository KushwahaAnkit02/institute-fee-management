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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RecordPaymentForm } from "@/types/payment";
import type { Student } from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(new Date().getFullYear(), i, 1);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
  return { value: key, label };
});

const paymentSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  month: z.string().min(1, "Please select a month"),
  amount_paid: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  payment_method: z
    .enum(["cash", "online", "cheque", "card"])
    .refine((v) => !!v, {
      message: "Please select a payment method",
    }),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payment: RecordPaymentForm) => void;
  students: Student[];
  adminId: string;
  studentId?: string;
  isLoading?: boolean;
}

export function PaymentModal({
  open,
  onClose,
  onSuccess,
  students,
  studentId,
  isLoading = false,
}: PaymentModalProps) {
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: studentId ?? "",
      month: currentMonthKey,
      amount_paid: undefined,
      payment_method: undefined,
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const selectedStudentId = useWatch({ control, name: "student_id" });
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  useEffect(() => {
    if (selectedStudent) {
      setValue("amount_paid", selectedStudent.monthly_fee);
    }
  }, [selectedStudent, setValue]);

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: PaymentFormValues) {
    onSuccess({
      student_id: values.student_id,
      month: values.month,
      amount_paid: values.amount_paid,
      payment_method: values.payment_method,
      payment_date: values.payment_date,
      notes: values.notes,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary to-accent rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                <CreditCard className="w-5 h-5 text-primary" />
                Record Payment
              </DialogTitle>
              <DialogDescription>
                Record a fee payment for a student.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              {/* Student */}
              <div className="space-y-1.5">
                <Label>Student *</Label>
                <Controller
                  name="student_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || !!studentId}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.student_id && "border-destructive",
                        )}
                        data-ocid="payment-modal.student_select"
                      >
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name} — ₹
                            {s.monthly_fee.toLocaleString("en-IN")}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.student_id && (
                  <p className="text-xs text-destructive">
                    {errors.student_id.message}
                  </p>
                )}
                {selectedStudent && (
                  <p className="text-xs text-muted-foreground">
                    Monthly fee:{" "}
                    <span className="font-semibold text-foreground">
                      ₹{selectedStudent.monthly_fee.toLocaleString("en-IN")}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Month */}
                <div className="space-y-1.5">
                  <Label>Month *</Label>
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          className={cn(errors.month && "border-destructive")}
                          data-ocid="payment-modal.month_select"
                        >
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.month && (
                    <p className="text-xs text-destructive">
                      {errors.month.message}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="amount_paid">Amount (₹) *</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    min={0}
                    placeholder="1500"
                    disabled={isLoading}
                    {...register("amount_paid", { valueAsNumber: true })}
                    className={cn(errors.amount_paid && "border-destructive")}
                    data-ocid="payment-modal.amount_input"
                  />
                  {errors.amount_paid && (
                    <p className="text-xs text-destructive">
                      {errors.amount_paid.message}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <Label>Payment Method *</Label>
                  <Controller
                    name="payment_method"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          className={cn(
                            errors.payment_method && "border-destructive",
                          )}
                          data-ocid="payment-modal.method_select"
                        >
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.payment_method && (
                    <p className="text-xs text-destructive">
                      {errors.payment_method.message}
                    </p>
                  )}
                </div>

                {/* Payment Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    disabled={isLoading}
                    {...register("payment_date")}
                    className={cn(errors.payment_date && "border-destructive")}
                    data-ocid="payment-modal.date_input"
                  />
                  {errors.payment_date && (
                    <p className="text-xs text-destructive">
                      {errors.payment_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes..."
                  rows={2}
                  disabled={isLoading}
                  {...register("notes")}
                  data-ocid="payment-modal.notes_textarea"
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="payment-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="payment-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
