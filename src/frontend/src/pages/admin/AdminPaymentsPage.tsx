import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  useAddPayment,
  useDeletePayment,
  usePayments,
} from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import type {
  Payment,
  PaymentMethod,
  RecordPaymentForm,
} from "@/types/payment";
import { formatMonth, getCurrentMonthKey } from "@/utils/formatters";
import {
  BookOpen,
  Calendar,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const METHOD_BADGE: Record<
  PaymentMethod,
  { label: string; className: string }
> = {
  cash: { label: "Cash", className: "bg-emerald-500/15 text-emerald-600" },
  online: { label: "Online", className: "bg-blue-500/15 text-blue-600" },
  cheque: { label: "Cheque", className: "bg-amber-500/15 text-amber-600" },
  card: { label: "Card", className: "bg-purple-500/15 text-purple-600" },
};

const PM_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

/* ---------- Record Payment Modal ---------- */
interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

function RecordPaymentModal({ open, onClose }: RecordPaymentModalProps) {
  const { data: students = [] } = useStudents();
  const addPayment = useAddPayment();
  const activeStudents = students.filter((s) => s.is_active);

  const [form, setForm] = useState<RecordPaymentForm>({
    student_id: "",
    month: getCurrentMonthKey(),
    amount_paid: 0,
    payment_method: "cash" as PaymentMethod,
    notes: "",
    payment_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<{
    student_id?: string;
    amount_paid?: string;
  }>({});

  const selectedStudent = activeStudents.find((s) => s.id === form.student_id);

  function handleStudentChange(id: string) {
    const s = activeStudents.find((st) => st.id === id);
    setForm((p) => ({
      ...p,
      student_id: id,
      amount_paid: s?.monthly_fee ?? p.amount_paid,
    }));
    if (errors.student_id) setErrors((e) => ({ ...e, student_id: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { student_id?: string; amount_paid?: string } = {};
    if (!form.student_id) errs.student_id = "Select a student";
    if (!form.amount_paid || form.amount_paid <= 0)
      errs.amount_paid = "Amount must be > 0";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await addPayment.mutateAsync(form);
      toast.success(
        `Payment of ₹${form.amount_paid.toLocaleString("en-IN")} recorded for ${selectedStudent?.name}!`,
      );
      setForm({
        student_id: "",
        month: getCurrentMonthKey(),
        amount_paid: 0,
        payment_method: "cash",
        notes: "",
        payment_date: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      onClose();
    } catch {
      toast.error("Failed to record payment");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-14 sm:w-full sm:max-w-lg z-50"
            data-ocid="record_payment_modal.dialog"
          >
            <div className="glass-card rounded-2xl shadow-elevated overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                <div>
                  <h2 className="font-display font-semibold text-xl text-foreground">
                    Record Payment
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add a new payment transaction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-fast"
                  data-ocid="record_payment_modal.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>
                    Student <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.student_id}
                    onValueChange={handleStudentChange}
                  >
                    <SelectTrigger
                      className={errors.student_id ? "border-destructive" : ""}
                      data-ocid="record_payment_modal.student_select"
                    >
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — ₹{s.monthly_fee.toLocaleString("en-IN")}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.student_id && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="record_payment_modal.student_error"
                    >
                      {errors.student_id}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Month</Label>
                    <Input
                      type="month"
                      value={form.month}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, month: e.target.value }))
                      }
                      data-ocid="record_payment_modal.month_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Amount (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.amount_paid || ""}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          amount_paid: Number(e.target.value),
                        }));
                        if (errors.amount_paid)
                          setErrors((er) => ({
                            ...er,
                            amount_paid: undefined,
                          }));
                      }}
                      className={errors.amount_paid ? "border-destructive" : ""}
                      data-ocid="record_payment_modal.amount_input"
                    />
                    {errors.amount_paid && (
                      <p className="text-xs text-destructive">
                        {errors.amount_paid}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Payment Method</Label>
                    <Select
                      value={form.payment_method}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          payment_method: v as PaymentMethod,
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="record_payment_modal.method_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PM_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Date</Label>
                    <Input
                      type="date"
                      value={form.payment_date}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          payment_date: e.target.value,
                        }))
                      }
                      data-ocid="record_payment_modal.date_input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="e.g. UPI reference, cheque no..."
                    value={form.notes ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={2}
                    data-ocid="record_payment_modal.notes_input"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    data-ocid="record_payment_modal.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-accent text-primary-foreground"
                    disabled={addPayment.isPending}
                    data-ocid="record_payment_modal.submit_button"
                  >
                    {addPayment.isPending ? "Recording..." : "Record Payment"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AdminPaymentsPage() {
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const deleteMutation = useDeletePayment();

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">(
    "all",
  );
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const studentMap = new Map(students.map((s) => [s.id, s]));

  const months = useMemo(() => {
    const set = new Set(payments.map((p) => p.month));
    return Array.from(set).sort().reverse();
  }, [payments]);

  const filtered = useMemo(() => {
    let list = [...payments];
    const q = search.toLowerCase();
    if (q)
      list = list.filter((p) =>
        (studentMap.get(p.student_id)?.name ?? "").toLowerCase().includes(q),
      );
    if (filterMonth !== "all")
      list = list.filter((p) => p.month === filterMonth);
    if (filterMethod !== "all")
      list = list.filter((p) => p.payment_method === filterMethod);
    return list.sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    );
  }, [payments, search, filterMonth, filterMethod, studentMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalAmount = filtered.reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 py-6 space-y-6" data-ocid="payments.page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Payment History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All recorded payment transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Total (filtered)
                </p>
                <p className="font-display font-bold text-foreground">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setRecordOpen(true)}
              className="gradient-accent text-primary-foreground shadow-soft"
              data-ocid="payments.add_button"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Record Payment
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by student name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60"
              data-ocid="payments.search_input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger
              className="w-full sm:w-48 bg-card/60"
              data-ocid="payments.month_filter"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterMethod}
            onValueChange={(v) => setFilterMethod(v as PaymentMethod | "all")}
          >
            <SelectTrigger
              className="w-full sm:w-44 bg-card/60"
              data-ocid="payments.method_filter"
            >
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Transactions
            </h3>
            <Badge variant="secondary" className="text-xs">
              {filtered.length} records
            </Badge>
          </div>
          {paymentsLoading || studentsLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" rows={5} />
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No payments found"
              description="No payments match your filters."
              dataOcid="payments.empty_state"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Student
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Month
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Method
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginated.map((payment, idx) => {
                      const m = METHOD_BADGE[payment.payment_method];
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b border-border/10 hover:bg-primary/5 transition-fast"
                          data-ocid={`payments.item.${idx + 1}`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                                {(
                                  studentMap.get(payment.student_id)?.name ??
                                  "Unknown"
                                )
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="font-medium text-foreground truncate max-w-[120px]">
                                {studentMap.get(payment.student_id)?.name ??
                                  "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                            {formatMonth(payment.month)}
                          </td>
                          <td className="px-5 py-3 text-right font-display font-semibold text-foreground">
                            ₹{payment.amount_paid.toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.className}`}
                            >
                              {m.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                            {new Date(payment.payment_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(payment)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast"
                              aria-label="Delete payment"
                              data-ocid={`payments.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
          {!paymentsLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="payments.pagination_prev"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="payments.pagination_next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RecordPaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Payment?"
        description={`This will permanently delete the payment of ₹${
          deleteTarget?.amount_paid?.toLocaleString("en-IN") ?? ""
        } for ${
          deleteTarget
            ? (studentMap.get(deleteTarget.student_id)?.name ?? "Unknown")
            : ""
        }.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Payment deleted.");
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </PageTransition>
  );
}
