import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyPayments } from "@/hooks/usePayments";
import { useMyStudentRecord } from "@/hooks/useStudents";
import type { Payment } from "@/types/payment";
import type { PaymentMethod } from "@/types/payment";
import { formatDate, formatMonth } from "@/utils/formatters";
import { BookOpen, CreditCard, Receipt, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

const METHOD_BADGE: Record<PaymentMethod, string> = {
  cash: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  online: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  cheque: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  card: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

const METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: "💵",
  online: "🌐",
  cheque: "📄",
  card: "💳",
};

export default function StudentPaymentsPage() {
  const { data: studentRecord } = useMyStudentRecord();
  const { data: payments = [], isLoading } = useMyPayments(studentRecord?.id);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [receiptModal, setReceiptModal] = useState<{
    payment: Payment;
    student: import("@/types/student").Student;
  } | null>(null);

  const months = useMemo(() => {
    const set = new Set(payments.map((p) => p.month));
    return Array.from(set).sort().reverse();
  }, [payments]);

  const filtered = useMemo(() => {
    let list = [...payments];
    if (filterMonth !== "all")
      list = list.filter((p) => p.month === filterMonth);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.payment_method.includes(q) ||
          (p.notes?.toLowerCase().includes(q) ?? false) ||
          formatMonth(p.month).toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    );
  }, [payments, filterMonth, search]);

  const totalAll = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalFiltered = filtered.reduce((sum, p) => sum + p.amount_paid, 0);
  const avgMonthly =
    months.length > 0 ? Math.round(totalAll / months.length) : 0;
  const isFiltering = filterMonth !== "all" || search.length > 0;

  const summaryCards = [
    {
      label: "Total Paid",
      value: `₹${totalAll.toLocaleString("en-IN")}`,
      sub: `${payments.length} transactions`,
      accent: "text-primary",
      ocid: "student-payments.summary_total",
    },
    {
      label: "Count of Payments",
      value: String(payments.length),
      sub: `${months.length} distinct months`,
      accent: "text-emerald-500",
      ocid: "student-payments.summary_count",
    },
    {
      label: "Average Monthly",
      value: `₹${avgMonthly.toLocaleString("en-IN")}`,
      sub: "per month avg",
      accent: "text-amber-500",
      ocid: "student-payments.summary_avg",
    },
  ];

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6"
        data-ocid="student-payments.page"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Payments
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Complete history of all your payments
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="glass-card rounded-2xl p-5 shadow-soft"
                data-ocid={card.ocid}
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p
                  className={`font-display text-2xl font-bold mt-1 ${card.accent}`}
                >
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.sub}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filtered total chip */}
        {isFiltering && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-primary/20 bg-primary/5"
          >
            <span className="text-xs text-muted-foreground">
              Filtered total:
            </span>
            <span className="text-sm font-semibold text-primary">
              ₹{totalFiltered.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">
              ({filtered.length} results)
            </span>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by method, month, or notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60"
              data-ocid="student-payments.search_input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger
              className="w-full sm:w-48 bg-card/60"
              data-ocid="student-payments.month_filter"
            >
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
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
          {isLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" rows={5} />
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Your payment history will appear here once your admin records a payment."
              dataOcid="student-payments.empty_state"
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No results found"
              description="Try adjusting your search or filter to find what you're looking for."
              actionLabel="Clear filters"
              onAction={() => {
                setSearch("");
                setFilterMonth("all");
              }}
              dataOcid="student-payments.no_results_state"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Month
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Method
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Notes
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-border/10 hover:bg-primary/5 transition-fast"
                      data-ocid={`student-payments.item.${idx + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatMonth(p.month)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-display font-semibold text-foreground">
                          ₹{p.amount_paid.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <Badge
                          className={`text-xs capitalize ${
                            METHOD_BADGE[p.payment_method] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          <span className="mr-1">
                            {METHOD_ICONS[p.payment_method] ?? ""}
                          </span>
                          {p.payment_method}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden lg:table-cell max-w-[180px] truncate">
                        {p.notes ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        {studentRecord ? (
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptModal({
                                payment: p,
                                student: studentRecord,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-fast"
                            data-ocid={`student-payments.receipt_button.${idx + 1}`}
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {receiptModal && (
        <ReceiptModal
          isOpen={!!receiptModal}
          onClose={() => setReceiptModal(null)}
          payment={receiptModal.payment}
          student={receiptModal.student}
        />
      )}
    </PageTransition>
  );
}
