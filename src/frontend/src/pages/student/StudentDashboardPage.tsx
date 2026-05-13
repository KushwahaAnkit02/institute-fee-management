import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import {
  useMarkAsRead,
  useStudentNotifications,
} from "@/hooks/useNotifications";
import { usePaymentsByStudent } from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types/notification";
import {
  formatDate,
  formatMonth,
  getCurrentMonthKey,
  getMonthKey,
} from "@/utils/formatters";
import {
  Bell,
  BellOff,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const METHOD_COLORS: Record<string, string> = {
  cash: "bg-emerald-500/15 text-emerald-600",
  online: "bg-blue-500/15 text-blue-600",
  cheque: "bg-amber-500/15 text-amber-600",
  card: "bg-purple-500/15 text-purple-600",
};

const NOTIF_ICONS: Record<string, React.ElementType> = {
  alert: Bell,
  reminder: Clock,
  update: CheckCircle2,
};

function NotificationItem({
  notif,
  onRead,
}: { notif: Notification; onRead: (id: string) => void }) {
  const IconComp = NOTIF_ICONS[notif.type] ?? Bell;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-xl transition-fast cursor-default ${
        !notif.is_read
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted/30"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          !notif.is_read ? "bg-primary/15" : "bg-muted"
        }`}
      >
        <IconComp
          className={`w-4 h-4 ${
            !notif.is_read ? "text-primary" : "text-muted-foreground"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p
            className={`text-sm font-medium truncate ${
              !notif.is_read ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {notif.title}
          </p>
          {!notif.is_read && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notif.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {new Date(notif.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </p>
      </div>
      {!notif.is_read && (
        <button
          type="button"
          onClick={() => onRead(notif.id)}
          aria-label="Mark as read"
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuthStore();
  const studentId = user?.id ?? "";
  const { data: allStudents = [] } = useStudents();
  const studentRecord = allStudents.find((s) => s.id === studentId);
  const { data: payments = [], isLoading: paymentsLoading } =
    usePaymentsByStudent(studentId);
  const { data: notifications = [], isLoading: notifLoading } =
    useStudentNotifications(studentId);
  const markAsRead = useMarkAsRead();

  const currentMonth = getCurrentMonthKey();
  const paidThisMonth = payments
    .filter((p) => getMonthKey(p.payment_date) === currentMonth)
    .reduce((sum, p) => sum + p.amount_paid, 0);
  const monthlyFee = studentRecord?.monthly_fee ?? 0;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const pendingAmount = Math.max(0, monthlyFee - paidThisMonth);
  const isPaidThisMonth = pendingAmount === 0 && monthlyFee > 0;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    )
    .slice(0, 5);
  const recentNotifs = notifications.slice(0, 3);

  // Build 6-month chart data
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const paid = payments
      .filter((p) => getMonthKey(p.payment_date) === key)
      .reduce((sum, p) => sum + p.amount_paid, 0);
    return { month: MONTH_NAMES[d.getMonth()], paid };
  });

  const statsCards = [
    {
      title: "Monthly Fee",
      value: `₹${monthlyFee.toLocaleString("en-IN")}`,
      icon: Wallet,
      accent: "text-primary",
      bg: "bg-primary/10",
      subtitle: studentRecord?.course ?? "—",
    },
    {
      title: "Paid This Month",
      value: `₹${paidThisMonth.toLocaleString("en-IN")}`,
      icon: CheckCircle2,
      accent: "text-emerald-500",
      bg: "bg-emerald-500/10",
      subtitle: isPaidThisMonth ? "Fully cleared" : "Partial payment",
    },
    {
      title: "Pending Amount",
      value: `₹${pendingAmount.toLocaleString("en-IN")}`,
      icon: pendingAmount > 0 ? Clock : CheckCircle2,
      accent: pendingAmount > 0 ? "text-amber-500" : "text-emerald-500",
      bg: pendingAmount > 0 ? "bg-amber-500/10" : "bg-emerald-500/10",
      subtitle: pendingAmount > 0 ? "Outstanding" : "All clear",
    },
    {
      title: "Total Paid",
      value: `₹${totalPaid.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      accent: "text-primary",
      bg: "bg-primary/10",
      subtitle: `${payments.length} transactions`,
    },
  ];

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6"
        data-ocid="student-dashboard.page"
      >
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl px-6 py-5 shadow-soft overflow-hidden relative"
          data-ocid="student-dashboard.welcome_card"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary/5 pointer-events-none" />
          <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-accent/8 pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user?.name ?? "Student"}
                </span>
              </h1>
              {studentRecord && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                    {studentRecord.class_}
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    {studentRecord.course}
                  </Badge>
                </div>
              )}
            </div>
            <div className="glass-card rounded-xl px-4 py-3 shrink-0">
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                {isPaidThisMonth ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isPaidThisMonth ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {isPaidThisMonth ? "Paid" : "Pending"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatMonth(currentMonth)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          data-ocid="student-dashboard.stats_section"
        >
          {statsCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.08,
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-5 shadow-soft cursor-default"
              data-ocid={`student-dashboard.stats_card.${idx + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className={`p-2 rounded-xl ${card.bg} ${card.accent}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart + Notifications row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5 shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">
                Payment Trend
              </h3>
              <span className="text-xs text-muted-foreground">
                Last 6 months
              </span>
            </div>
            {paymentsLoading ? (
              <div className="h-[180px] flex items-center justify-center">
                <LoadingSkeleton variant="card" rows={3} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="payGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(var(--primary))"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    axisLine={false}
                    tickLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    axisLine={false}
                    tickLine={false}
                    className="text-muted-foreground"
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${v / 1000}K` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(var(--card) / 0.95)",
                      border: "1px solid oklch(var(--border) / 0.4)",
                      borderRadius: "12px",
                      color: "oklch(var(--foreground))",
                      fontSize: "13px",
                    }}
                    formatter={(v: number) => [
                      `₹${v.toLocaleString("en-IN")}`,
                      "Paid",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="oklch(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#payGradient)"
                    dot={{ fill: "oklch(var(--primary))", r: 3.5 }}
                    activeDot={{ r: 5.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Recent Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card rounded-2xl shadow-soft overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifLoading ? (
              <div className="p-4">
                <LoadingSkeleton variant="list" rows={3} />
              </div>
            ) : recentNotifs.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description="You're all caught up!"
                dataOcid="student_notif.empty_state"
              />
            ) : (
              <div className="p-3 space-y-2">
                {recentNotifs.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notif={n}
                    onRead={(id) => markAsRead.mutate(id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Recent Payments
            </h3>
            {recentPayments.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Last {recentPayments.length} transactions
              </span>
            )}
          </div>
          {paymentsLoading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" rows={5} />
            </div>
          ) : recentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Your payment history will appear here once your admin records a payment."
              dataOcid="student_recent_payments.empty_state"
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
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/10 hover:bg-primary/5 transition-fast"
                      data-ocid={`student_recent_payments.item.${idx + 1}`}
                    >
                      <td className="px-5 py-3 text-foreground font-medium">
                        {formatMonth(p.month)}
                      </td>
                      <td className="px-5 py-3 text-right font-display font-semibold text-foreground">
                        ₹{p.amount_paid.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            METHOD_COLORS[p.payment_method] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {formatDate(p.payment_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
