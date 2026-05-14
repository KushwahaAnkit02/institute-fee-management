import { PaymentModal } from "@/components/modals/PaymentModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddPayment,
  useDeletePayment,
  usePayments,
} from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import { useAuthStore } from "@/store/authStore";
import type {
  Payment,
  PaymentMethod,
  RecordPaymentForm,
} from "@/types/payment";
import { formatMonth } from "@/utils/formatters";
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

const _PM_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
];

export function AdminPaymentsPage() {
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const deleteMutation = useDeletePayment();
  const addPayment = useAddPayment();
  const admin = useAuthStore((s) => s.admin);

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">(
    "all",
  );
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  async function handleRecordPayment(form: RecordPaymentForm) {
    try {
      await addPayment.mutateAsync(form);
      const student = students.find((s) => s.id === form.student_id);
      toast.success(
        `Payment of ₹${form.amount_paid.toLocaleString("en-IN")} recorded for ${student?.full_name ?? "student"}!`,
      );
      setRecordOpen(false);
    } catch {
      toast.error("Failed to record payment");
    }
  }

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
        (studentMap.get(p.student_id)?.full_name ?? "")
          .toLowerCase()
          .includes(q),
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
                                  studentMap.get(payment.student_id)
                                    ?.full_name ?? "Unknown"
                                )
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="font-medium text-foreground truncate max-w-[120px]">
                                {studentMap.get(payment.student_id)
                                  ?.full_name ?? "Unknown"}
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

      <PaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onSuccess={handleRecordPayment}
        students={students.filter((s) => s.is_active)}
        adminId={admin?.id ?? ""}
        isLoading={addPayment.isPending}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Payment?"
        description={`This will permanently delete the payment of ₹${
          deleteTarget?.amount_paid?.toLocaleString("en-IN") ?? ""
        } for ${
          deleteTarget
            ? (studentMap.get(deleteTarget.student_id)?.full_name ?? "Unknown")
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
