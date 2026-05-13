import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { StatsCard } from "@/components/shared/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import type { Payment, PaymentMethod } from "@/types/payment";
import type { Student } from "@/types/student";
import { formatCurrency } from "@/utils/formatters";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: "bg-emerald-500/20 text-emerald-600",
  online: "bg-blue-500/20 text-blue-600",
  cheque: "bg-amber-500/20 text-amber-600",
  card: "bg-purple-500/20 text-purple-600",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// biome-ignore lint/correctness/noUnusedVariables: kept for potential use
function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
}: { target: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (v >= 1_000) return `${prefix}${(v / 1000).toFixed(1)}K${suffix}`;
    return `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`;
  });

  useEffect(() => {
    const ctrl = animate(count, target, { duration: 1.2, ease: "easeOut" });
    return ctrl.stop;
  }, [count, target]);

  return <motion.span>{rounded}</motion.span>;
}

function RevenueChart({
  data,
}: { data: { month: string; revenue: number }[] }) {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Monthly Revenue
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.72 0.18 192)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.72 0.18 192)"
                stopOpacity={0.02}
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
            formatter={(value: number) => [
              `₹${value.toLocaleString("en-IN")}`,
              "Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.72 0.18 192)"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
            dot={{ fill: "oklch(0.72 0.18 192)", r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function FeeDistributionChart({
  data,
}: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const collected = data[0]?.value ?? 0;
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 shadow-soft">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Fee Distribution
      </h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "oklch(var(--card) / 0.95)",
                border: "1px solid oklch(var(--border) / 0.4)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-foreground">
              {pct}%
            </p>
            <p className="text-xs text-muted-foreground">Collected</p>
          </div>
          <div className="space-y-1.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-muted-foreground flex-1">{d.name}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentPaymentsTable({
  payments,
  students,
  isLoading,
}: { payments: Payment[]; students: Student[]; isLoading: boolean }) {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const recent = [...payments]
    .sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    )
    .slice(0, 8);

  return (
    <div className="glass-card rounded-2xl shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Recent Payments
        </h3>
        <Badge variant="secondary" className="text-xs">
          {payments.length} total
        </Badge>
      </div>
      {isLoading ? (
        <div className="p-4">
          <LoadingSkeleton variant="table" rows={5} />
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Recorded payments will appear here."
          dataOcid="recent-payments.empty_state"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Student
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
              {recent.map((payment, idx) => {
                const student = studentMap.get(payment.student_id);
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/10 hover:bg-primary/5 transition-fast"
                    data-ocid={`recent-payments.item.${idx + 1}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                          {student ? getInitials(student.name) : "?"}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {student?.name ??
                            `Student ${payment.student_id.slice(0, 6)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-display font-semibold text-foreground">
                      ₹{payment.amount_paid.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_METHOD_COLORS[payment.payment_method]}`}
                      >
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {new Date(payment.payment_date).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecentStudentsList({
  students,
  isLoading,
  onNavigate,
}: { students: Student[]; isLoading: boolean; onNavigate: () => void }) {
  const recent = [...students]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="glass-card rounded-2xl shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          Recent Students
        </h3>
        <button
          type="button"
          onClick={onNavigate}
          className="text-xs text-primary hover:text-primary/80 transition-fast font-medium"
          data-ocid="recent-students.view_all_link"
        >
          View all →
        </button>
      </div>
      <div className="p-4 space-y-2">
        {isLoading ? (
          <LoadingSkeleton variant="list" rows={5} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            description="Students you add will appear here."
            dataOcid="recent-students.empty_state"
          />
        ) : (
          recent.map((student, idx) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={onNavigate}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-fast cursor-pointer group"
              data-ocid={`recent-students.item.${idx + 1}`}
            >
              <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {getInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-fast">
                  {student.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {student.class_} · {student.course}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-sm font-semibold text-foreground">
                  ₹{student.monthly_fee.toLocaleString("en-IN")}/mo
                </p>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${student.is_active ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                >
                  {student.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const {
    totalStudents,
    totalRevenue,
    pendingFees,
    paidThisMonth,
    revenueChartData,
    paymentStatusData,
    students,
    payments,
    isLoading,
  } = useAdminDashboard();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const now = new Date();
  const MONTH_LABELS = [
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

  return (
    <PageTransition className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        data-ocid="admin-dashboard.page"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/notifications" })}
            className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl text-sm font-medium text-amber-600 border border-amber-500/20 hover:bg-amber-500/10 transition-fast"
            data-ocid="dashboard.notifications_badge"
          >
            <Bell className="w-4 h-4" />
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <LoadingSkeleton variant="stats" />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-ocid="admin-dashboard.stats_section"
        >
          <StatsCard
            title="Total Students"
            value={String(totalStudents)}
            subtitle={`${students.length} total enrolled`}
            icon={Users}
            accentColor="text-primary"
            delay={0}
            dataOcid="stats.total_students_card"
          />
          <StatsCard
            title="Total Collection"
            value={formatCurrency(totalRevenue)}
            subtitle={`${payments.length} payments recorded`}
            icon={IndianRupee}
            accentColor="text-primary"
            delay={0.08}
            dataOcid="stats.total_collection_card"
          />
          <StatsCard
            title="Pending Fees"
            value={formatCurrency(pendingFees)}
            subtitle="Estimated uncollected"
            icon={AlertCircle}
            accentColor="text-amber-500"
            delay={0.16}
            dataOcid="stats.pending_fees_card"
          />
          <StatsCard
            title="Paid This Month"
            value={formatCurrency(paidThisMonth)}
            subtitle={`${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`}
            icon={CheckCircle2}
            accentColor="text-emerald-500"
            delay={0.24}
            dataOcid="stats.monthly_revenue_card"
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
        data-ocid="admin-dashboard.charts_section"
      >
        <div className="lg:col-span-3">
          <RevenueChart data={revenueChartData} />
        </div>
        <div className="lg:col-span-2">
          <FeeDistributionChart data={paymentStatusData} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="glass-card rounded-2xl p-5 shadow-soft"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate({ to: "/admin/students" })}
            className="gap-2 gradient-accent text-primary-foreground"
            data-ocid="dashboard.add_student_button"
          >
            <UserPlus className="w-4 h-4" /> Add Student
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/admin/payments" })}
            className="gap-2"
            data-ocid="dashboard.record_payment_button"
          >
            <IndianRupee className="w-4 h-4" /> Record Payment
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/admin/notifications" })}
            className="gap-2"
            data-ocid="dashboard.send_notification_button"
          >
            <Bell className="w-4 h-4" /> Send Notification
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.34 }}
        className="grid grid-cols-1 xl:grid-cols-5 gap-4"
        data-ocid="admin-dashboard.activity_section"
      >
        <div className="xl:col-span-3">
          <RecentPaymentsTable
            payments={payments}
            students={students}
            isLoading={isLoading}
          />
        </div>
        <div className="xl:col-span-2">
          <RecentStudentsList
            students={students}
            isLoading={isLoading}
            onNavigate={() => navigate({ to: "/admin/students" })}
          />
        </div>
      </motion.div>
    </PageTransition>
  );
}
