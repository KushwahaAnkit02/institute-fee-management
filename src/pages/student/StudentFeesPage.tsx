import { ReceiptModal } from "@/components/modals/ReceiptModal";
import { UpiPayModal } from "@/components/modals/UpiPayModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyPayments } from "@/hooks/usePayments";
import { useMyStudentRecord } from "@/hooks/useStudents";
import { useAuthStore } from "@/store/authStore";
import {
  formatMonth,
  getCurrentMonthKey,
  getMonthKey,
} from "@/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

function buildMonthsSince(
  startDate: string,
  monthlyFee: number,
  payments: Array<{ month: string; amount_paid: number }>,
) {
  const start = new Date(startDate);
  const now = new Date();
  const months: Array<{
    key: string;
    paid: number;
    status: "Paid" | "Partial" | "Pending" | "Current";
    year: number;
  }> = [];

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= now) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
    const monthPaid = payments
      .filter((p) => p.month === key)
      .reduce((sum, p) => sum + p.amount_paid, 0);
    const isCurrentMonth = key === getCurrentMonthKey();
    let status: "Paid" | "Partial" | "Pending" | "Current";
    if (monthPaid >= monthlyFee) {
      status = "Paid";
    } else if (monthPaid > 0) {
      status = "Partial";
    } else if (isCurrentMonth) {
      status = "Current";
    } else {
      status = "Pending";
    }
    months.push({ key, paid: monthPaid, status, year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months.reverse();
}

const STATUS_CONFIG = {
  Paid: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bg: "bg-emerald-500/15",
    badge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    label: "Paid",
  },
  Partial: {
    icon: Clock,
    iconColor: "text-amber-500",
    bg: "bg-amber-500/15",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    label: "Partial",
  },
  Current: {
    icon: AlertCircle,
    iconColor: "text-blue-500",
    bg: "bg-blue-500/15",
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    label: "Due",
  },
  Pending: {
    icon: AlertCircle,
    iconColor: "text-destructive",
    bg: "bg-destructive/10",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    label: "Overdue",
  },
};

export default function StudentFeesPage() {
  const { user } = useAuthStore();
  const { data: studentRecord, isLoading: studentLoading } =
    useMyStudentRecord();
  const { data: payments = [], isLoading } = useMyPayments();

  const currentMonth = getCurrentMonthKey();
  const monthlyFee = studentRecord?.monthly_fee ?? 0;
  const paidThisMonth = payments
    .filter((p) => getMonthKey(p.payment_date) === currentMonth)
    .reduce((sum, p) => sum + p.amount_paid, 0);
  const pendingThisMonth = Math.max(0, monthlyFee - paidThisMonth);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);

  const allMonths = useMemo(() => {
    if (!studentRecord) return [];
    return buildMonthsSince(studentRecord.fee_start_date, monthlyFee, payments);
  }, [studentRecord, monthlyFee, payments]);

  const years = useMemo(() => {
    const s = new Set(allMonths.map((m) => m.year));
    return Array.from(s).sort().reverse();
  }, [allMonths]);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending">("all");
  const [payModal, setPayModal] = useState<{
    monthKey: string;
    monthLabel: string;
    amountDue: number;
  } | null>(null);
  const [receiptModal, setReceiptModal] = useState<{
    payment: import("@/types/payment").Payment;
    student: import("@/types/student").Student;
  } | null>(null);
  const queryClient = useQueryClient();

  const filteredByYear = useMemo(() => {
    if (selectedYear === "all") return allMonths;
    return allMonths.filter((m) => m.year === Number(selectedYear));
  }, [allMonths, selectedYear]);

  const filteredMonths = useMemo(() => {
    if (activeTab === "paid")
      return filteredByYear.filter((m) => m.status === "Paid");
    if (activeTab === "pending")
      return filteredByYear.filter((m) => m.status !== "Paid");
    return filteredByYear;
  }, [filteredByYear, activeTab]);

  const overdueCount = filteredByYear.filter(
    (m) => m.status === "Pending",
  ).length;
  const paidCount = filteredByYear.filter((m) => m.status === "Paid").length;
  const pendingCount = filteredByYear.filter((m) => m.status !== "Paid").length;

  const summaryCards = [
    {
      title: "Monthly Fee",
      value: `₹${monthlyFee.toLocaleString("en-IN")}`,
      sub: studentRecord?.course ?? "—",
      icon: IndianRupee,
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Total Paid",
      value: `₹${totalPaid.toLocaleString("en-IN")}`,
      sub: `${paidCount} months cleared`,
      icon: TrendingUp,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "This Month Pending",
      value: `₹${pendingThisMonth.toLocaleString("en-IN")}`,
      sub: pendingThisMonth === 0 ? "All clear" : "Outstanding",
      icon: pendingThisMonth === 0 ? CheckCircle2 : Clock,
      accent: pendingThisMonth === 0 ? "text-emerald-500" : "text-amber-500",
      bg: pendingThisMonth === 0 ? "bg-emerald-500/10" : "bg-amber-500/10",
    },
  ];

  // Find the payment for a paid month (for receipt)
  function getPaymentForMonth(monthKey: string) {
    return (
      payments
        .filter((p) => p.month === monthKey)
        .sort(
          (a, b) =>
            new Date(b.payment_date).getTime() -
            new Date(a.payment_date).getTime(),
        )[0] ?? null
    );
  }

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6"
        data-ocid="student-fees.page"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Fees
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track your fee payment status month by month
            </p>
          </div>
          {overdueCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl px-4 py-3 border border-destructive/30 bg-destructive/5"
              data-ocid="student-fees.overdue_alert"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-destructive">
                    {overdueCount} overdue month{overdueCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Please contact admin
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-5 shadow-soft cursor-default"
              data-ocid={`student-fees.summary_card.${idx + 1}`}
            >
              {studentLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-muted/60 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-muted/60 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                    <div className={`p-2 rounded-xl ${card.bg} ${card.accent}`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.sub}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Enrollment Details */}
        {studentRecord && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl p-5 shadow-soft"
          >
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                Enrollment Details
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: "Class", value: studentRecord.class_ },
                { label: "Course", value: studentRecord.course },
                {
                  label: "Joined",
                  value: new Date(studentRecord.joined_date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  ),
                },
                {
                  label: "Status",
                  value: studentRecord.is_active ? "Active" : "Inactive",
                  isStatus: true,
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  {item.isStatus ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs">
                      {item.value}
                    </Badge>
                  ) : (
                    <p className="font-medium text-foreground">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Monthly Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="font-display font-semibold text-foreground flex-1">
                Monthly Fee Status
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status count chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                    <span className="font-semibold text-emerald-600">
                      {paidCount}
                    </span>{" "}
                    paid
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
                    <span className="font-semibold text-amber-600">
                      {pendingCount}
                    </span>{" "}
                    pending
                  </span>
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger
                    className="w-full sm:w-36 bg-card/60"
                    data-ocid="student-fees.year_filter"
                  >
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3 p-1 bg-muted/40 rounded-xl w-fit">
              {(["all", "paid", "pending"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-ocid={`student-fees.tab.${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="list" rows={6} />
            </div>
          ) : filteredMonths.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={
                activeTab === "paid"
                  ? "No paid months yet"
                  : activeTab === "pending"
                    ? "No pending fees — all clear!"
                    : "No fee records"
              }
              description={
                activeTab === "paid"
                  ? "Pay your fees and they'll show here."
                  : activeTab === "pending"
                    ? "Great job keeping up with payments!"
                    : "Fee records will appear here after your fee start date."
              }
              dataOcid="student-fees.empty_state"
            />
          ) : (
            <div className="p-4 space-y-2.5">
              {filteredMonths.map(({ key, paid, status }) => {
                const cfg = STATUS_CONFIG[status];
                const monthPayment = getPaymentForMonth(key);
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-fast"
                    data-ocid={`student-fees.month_row.${key}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}
                    >
                      <cfg.icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatMonth(key)}
                        {key === currentMonth && (
                          <span className="ml-2 text-[10px] bg-blue-500/15 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {paid > 0
                          ? `₹${paid.toLocaleString("en-IN")} paid`
                          : "No payment recorded"}
                        {monthlyFee > 0 && paid > 0 && paid < monthlyFee && (
                          <span className="ml-1 text-amber-500">
                            · ₹{(monthlyFee - paid).toLocaleString("en-IN")}{" "}
                            remaining
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="font-display font-semibold text-foreground text-sm">
                          ₹{monthlyFee.toLocaleString("en-IN")}
                        </p>
                        <Badge className={`text-[10px] mt-1 ${cfg.badge}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {status === "Paid" && monthPayment && studentRecord ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-3 h-auto py-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() =>
                            setReceiptModal({
                              payment: monthPayment,
                              student: studentRecord,
                            })
                          }
                          data-ocid={`student-fees.receipt_button.${key}`}
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      ) : status !== "Paid" ? (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 h-auto"
                          onClick={() =>
                            setPayModal({
                              monthKey: key,
                              monthLabel: formatMonth(key),
                              amountDue: monthlyFee - paid,
                            })
                          }
                          data-ocid={`student-fees.pay_button.${key}`}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay Now
                        </Button>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      {payModal && user && (
        <UpiPayModal
          isOpen={!!payModal}
          onClose={() => setPayModal(null)}
          monthKey={payModal.monthKey}
          monthLabel={payModal.monthLabel}
          amountDue={payModal.amountDue}
          studentId={user.student_id!}
          adminId={user.linked_admin_id!}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            setPayModal(null);
          }}
        />
      )}
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
