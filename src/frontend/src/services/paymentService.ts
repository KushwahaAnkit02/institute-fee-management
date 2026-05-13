import { supabase } from "@/lib/supabase";
import type { Payment, PaymentStats, RecordPaymentForm } from "@/types/payment";
import { getStudents } from "./studentService";

export async function getPayments(adminId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("admin_id", adminId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function getPaymentsByStudent(
  studentId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("student_id", studentId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function addPayment(
  adminId: string,
  form: RecordPaymentForm,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .insert({
      admin_id: adminId,
      student_id: form.student_id,
      month: form.month,
      amount_paid: form.amount_paid,
      payment_method: form.payment_method,
      notes: form.notes || null,
      payment_date: form.payment_date,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function updatePayment(
  id: string,
  form: Partial<RecordPaymentForm>,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .update(form)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase
    .from("monthly_payments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getPaymentStats(adminId: string): Promise<PaymentStats> {
  const students = await getStudents(adminId);
  const payments = await getPayments(adminId);

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
    return {
      month: d.toLocaleString("en-IN", { month: "short" }),
      revenue,
    };
  });

  const paymentStatusData = [
    { name: "Paid", value: totalPaid },
    { name: "Pending", value: totalPending },
  ];

  return { totalPaid, totalPending, revenueChartData, paymentStatusData };
}
