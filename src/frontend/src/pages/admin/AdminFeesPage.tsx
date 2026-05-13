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
import { useAddPayment, usePayments } from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import type { PaymentMethod } from "@/types/payment";
import type { Student } from "@/types/student";
import { formatMonth, getCurrentMonthKey } from "@/utils/formatters";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Percent,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

type FeeStatus = "Paid" | "Pending" | "Overdue";

function getFeeStatus(student: Student, paidThisMonth: number): FeeStatus {
  if (paidThisMonth >= student.monthly_fee) return "Paid";
  const startDate = new Date(student.fee_start_date);
  const now = new Date();
  if (now.getDate() > 10 && startDate < now) return "Overdue";
  return "Pending";
}

const STATUS_BADGE: Record<FeeStatus, string> = {
  Paid: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
  Overdue: "bg-destructive/15 text-destructive border border-destructive/30",
};

function buildMonthOptions(): { value: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { value: key, label: formatMonth(key) };
  });
}

interface RecordPaymentModalProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  defaultMonth: string;
}

function RecordPaymentModal({
  student,
  open,
  onClose,
  defaultMonth,
}: RecordPaymentModalProps) {
  const addPayment = useAddPayment();
  const [form, setForm] = useState({
    month: defaultMonth,
    amount_paid: student.monthly_fee,
    payment_method: "cash" as PaymentMethod,
    notes: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount_paid || form.amount_paid <= 0) {
      toast.error("Amount must be > 0");
      return;
    }
    try {
      await addPayment.mutateAsync({ student_id: student.id, ...form });
      toast.success(
        `Payment of ₹${form.amount_paid.toLocaleString("en-IN")} recorded for ${student.name}!`,
      );
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
            className="fixed inset-x-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-16 sm:w-full sm:max-w-lg z-50"
            data-ocid="record_payment_modal.dialog"
          >
            <div className="glass-card rounded-2xl shadow-elevated overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                <div>
                  <h2 className="font-display font-semibold text-xl text-foreground">
                    Record Payment
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For {student.name}
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
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.amount_paid}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          amount_paid: Number(e.target.value),
                        }))
                      }
                      data-ocid="record_payment_modal.amount_input"
                    />
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
                        {PAYMENT_METHODS.map((m) => (
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
                        setForm((p) => ({ ...p, payment_date: e.target.value }))
                      }
                      data-ocid="record_payment_modal.date_input"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="e.g. UPI reference, cheque no..."
                    value={form.notes}
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

export function AdminFeesPage() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FeeStatus | "all">("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  const studentFeeData = useMemo(() => {
    return students
      .filter((s) => s.is_active)
      .map((student) => {
        const studentPayments = payments.filter(
          (p) => p.student_id === student.id && p.month === selectedMonth,
        );
        const paidThisMonth = studentPayments.reduce(
          (sum, p) => sum + p.amount_paid,
          0,
        );
        const status = getFeeStatus(student, paidThisMonth);
        return { student, paidThisMonth, status };
      });
  }, [students, payments, selectedMonth]);

  const filtered = useMemo(() => {
    let list = studentFeeData;
    const q = search.toLowerCase();
    if (q)
      list = list.filter(
        (d) =>
          d.student.name.toLowerCase().includes(q) ||
          d.student.class_.toLowerCase().includes(q),
      );
    if (filterStatus !== "all")
      list = list.filter((d) => d.status === filterStatus);
    return list;
  }, [studentFeeData, search, filterStatus]);

  const paid = studentFeeData.filter((d) => d.status === "Paid").length;
  const pending = studentFeeData.filter((d) => d.status === "Pending").length;
  const totalCollectedThisMonth = studentFeeData.reduce(
    (sum, d) => sum + d.paidThisMonth,
    0,
  );
  const totalPotential = studentFeeData.reduce(
    (sum, d) => sum + d.student.monthly_fee,
    0,
  );
  const collectionRate =
    totalPotential > 0
      ? Math.round((totalCollectedThisMonth / totalPotential) * 100)
      : 0;

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 py-6 space-y-6" data-ocid="fees.page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Fee Collection
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track and collect monthly fees from students
            </p>
          </div>
          {/* Month Selector */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger
              className="w-full sm:w-52 bg-card/60"
              data-ocid="fees.month_selector"
            >
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Students",
              value: studentFeeData.length,
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Paid",
              value: paid,
              icon: CheckCircle2,
              color: "text-emerald-500",
            },
            {
              label: "Pending",
              value: pending,
              icon: Clock,
              color: "text-amber-500",
            },
            {
              label: "Collection Rate",
              value: `${collectionRate}%`,
              icon: Percent,
              color: "text-primary",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </div>
              <p className={`font-display text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Monthly Collection — {formatMonth(selectedMonth)}
              </span>
            </div>
            <span className="text-sm font-display font-bold text-primary">
              {collectionRate}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 rounded-full gradient-accent"
              initial={{ width: 0 }}
              animate={{ width: `${collectionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>
              Collected: ₹{totalCollectedThisMonth.toLocaleString("en-IN")}
            </span>
            <span>Target: ₹{totalPotential.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60"
              data-ocid="fees.search_input"
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
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as FeeStatus | "all")}
          >
            <SelectTrigger
              className="w-full sm:w-44 bg-card/60"
              data-ocid="fees.filter.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Students Fee Status
            </h3>
            <Badge variant="secondary" className="text-xs">
              {filtered.length} students
            </Badge>
          </div>
          {studentsLoading || paymentsLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" rows={5} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No students found"
              description="No students match your current filters."
              dataOcid="fees.empty_state"
            />
          ) : (
            <div className="divide-y divide-border/20">
              {filtered.map(({ student, paidThisMonth, status }, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-fast"
                  data-ocid={`fees.item.${idx + 1}`}
                >
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.class_} · {student.course}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-muted-foreground">Paid / Due</p>
                    <p className="text-sm font-medium text-foreground">
                      ₹{paidThisMonth.toLocaleString("en-IN")} / ₹
                      {student.monthly_fee.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[status]}`}
                  >
                    {status}
                  </span>
                  {status !== "Paid" ? (
                    <Button
                      size="sm"
                      className="gradient-accent text-primary-foreground shrink-0"
                      onClick={() => setSelectedStudent(student)}
                      data-ocid={`fees.collect_button.${idx + 1}`}
                    >
                      <IndianRupee className="w-3.5 h-3.5 mr-1" /> Collect
                    </Button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <RecordPaymentModal
          student={selectedStudent}
          open={!!selectedStudent}
          defaultMonth={selectedMonth}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </PageTransition>
  );
}
