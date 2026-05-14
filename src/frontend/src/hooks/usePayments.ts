import * as paymentSvc from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import type { Payment, PaymentStats, RecordPaymentForm } from "@/types/payment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePayments() {
  const admin = useAuthStore((s) => s.admin);
  const adminId = admin?.id;
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

/** Student-scoped: fetches payments for the current student by looking up via profile_id. */
export function useMyPayments(studentId?: string) {
  const resolvedId = studentId ?? "";
  return useQuery<Payment[]>({
    queryKey: ["payments", "student", resolvedId],
    queryFn: () => paymentSvc.getPaymentsByStudent(resolvedId),
    staleTime: 0,
    enabled: !!resolvedId,
  });
}

export function useAddPayment() {
  const admin = useAuthStore((s) => s.admin);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: RecordPaymentForm) =>
      paymentSvc.addPayment(admin?.id!, form),
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
  const admin = useAuthStore((s) => s.admin);
  const adminId = admin?.id;
  return useQuery<PaymentStats>({
    queryKey: ["payments", "stats", adminId],
    queryFn: () => paymentSvc.getPaymentStats(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}
