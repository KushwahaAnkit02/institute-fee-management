import * as paymentSvc from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import type { Payment, PaymentStats, RecordPaymentForm } from "@/types/payment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePayments() {
  const user = useAuthStore((s) => s.user);
  const adminId = user?.admin_id;
  return useQuery<Payment[]>({
    queryKey: ["payments", adminId],
    queryFn: () => paymentSvc.getPayments(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}

export function usePaymentsByStudent(studentId: string) {
  return useQuery<Payment[]>({
    queryKey: ["payments", "student", studentId],
    queryFn: () => paymentSvc.getPaymentsByStudent(studentId),
    staleTime: 0,
    enabled: !!studentId,
  });
}

/** Student-scoped: reads student_id from auth store automatically. */
export function useMyPayments() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.student_id ?? "";
  return useQuery<Payment[]>({
    queryKey: ["payments", "student", studentId],
    queryFn: () => paymentSvc.getPaymentsByStudent(studentId),
    staleTime: 0,
    enabled: !!studentId,
  });
}

export function useAddPayment() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: RecordPaymentForm) =>
      paymentSvc.addPayment(user?.admin_id!, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentSvc.deletePayment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function usePaymentStats() {
  const user = useAuthStore((s) => s.user);
  const adminId = user?.admin_id;
  return useQuery<PaymentStats>({
    queryKey: ["payments", "stats", adminId],
    queryFn: () => paymentSvc.getPaymentStats(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}
