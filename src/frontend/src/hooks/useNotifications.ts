import * as notifSvc from "@/services/notificationService";
import { useAuthStore } from "@/store/authStore";
import type {
  CreateNotificationForm,
  Notification,
} from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  const admin = useAuthStore((s) => s.admin);
  const adminId = admin?.id;
  return useQuery<Notification[]>({
    queryKey: ["notifications", adminId],
    queryFn: () => notifSvc.getNotifications(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}

export function useStudentNotifications(studentId: string) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", "student", studentId],
    queryFn: () => notifSvc.getNotificationsForStudent(studentId),
    staleTime: 0,
    enabled: !!studentId,
  });
}

/** Student-scoped: reads student_id from auth store automatically. */
/** Student-scoped: pass studentId from student record lookup. */
export function useMyNotifications(studentId?: string) {
  const resolvedId = studentId ?? "";
  return useQuery<Notification[]>({
    queryKey: ["notifications", "student", resolvedId],
    queryFn: () => notifSvc.getNotificationsForStudent(resolvedId),
    staleTime: 0,
    enabled: !!resolvedId,
  });
}

export function useAddNotification() {
  const admin = useAuthStore((s) => s.admin);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateNotificationForm) =>
      notifSvc.addNotification(admin?.id!, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notifSvc.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllAsRead() {
  const admin = useAuthStore((s) => s.admin);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notifSvc.markAllAsRead(admin?.id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notifSvc.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
