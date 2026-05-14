import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { Payment, PaymentStats, RecordPaymentForm } from "@/types/payment";
import { getStudents } from "./studentService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export async function getPayments(adminId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("admin_id", adminId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function getStudentPayments(
  studentId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("student_id", studentId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Payment[];
}

// Legacy alias
export const getPaymentsByStudent = getStudentPayments;

export async function getPaymentStats(adminId: string): Promise<
  PaymentStats & {
    totalStudents: number;
    monthlyData: Array<{ month: string; amount: number }>;
  }
> {
  const [students, payments] = await Promise.all([
    getStudents(adminId),
    getPayments(adminId),
  ]);

  const totalMonthlyFees = students.reduce((sum, s) => sum + s.monthly_fee, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalPending = Math.max(0, totalMonthlyFees - totalPaid);

  const now = new Date();
  const revenueChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const revenue = payments
      .filter((p) => p.month === monthKey)
      .reduce((sum, p) => sum + p.amount_paid, 0);
    return { month: d.toLocaleString("en-IN", { month: "short" }), revenue };
  });

  const monthlyData = revenueChartData.map((r) => ({
    month: r.month,
    amount: r.revenue,
  }));

  const paymentStatusData = [
    { name: "Paid", value: totalPaid },
    { name: "Pending", value: totalPending },
  ];

  return {
    totalPaid,
    totalPending,
    totalStudents: students.length,
    monthlyData,
    revenueChartData,
    paymentStatusData,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export async function recordPayment(
  data: RecordPaymentForm & { admin_id: string },
): Promise<Payment> {
  const { data: row, error } = await supabase
    .from("monthly_payments")
    .insert({
      admin_id: data.admin_id,
      student_id: data.student_id,
      month: data.month,
      amount_paid: data.amount_paid,
      payment_method: data.payment_method,
      notes: data.notes ?? null,
      payment_date: data.payment_date,
    } as TablesInsert<"monthly_payments">)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Payment record creation returned no data");
  return row as Payment;
}

// Legacy alias used by existing pages
export async function addPayment(
  adminId: string,
  form: RecordPaymentForm,
): Promise<Payment> {
  return recordPayment({ ...form, admin_id: adminId });
}

export async function updatePayment(
  id: string,
  form: Partial<RecordPaymentForm>,
): Promise<Payment> {
  const { data: row, error } = await supabase
    .from("monthly_payments")
    .update(form as TablesUpdate<"monthly_payments">)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Payment update returned no data");
  return row as Payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase
    .from("monthly_payments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
