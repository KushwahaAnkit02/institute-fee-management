import * as notifSvc from "@/services/notificationService";
import { useAuthStore } from "@/store/authStore";
import type {
  CreateNotificationForm,
  Notification,
} from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const adminId = user?.admin_id;
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
export function useMyNotifications() {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.student_id ?? "";
  return useQuery<Notification[]>({
    queryKey: ["notifications", "student", studentId],
    queryFn: () => notifSvc.getNotificationsForStudent(studentId),
    staleTime: 0,
    enabled: !!studentId,
  });
}

export function useAddNotification() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateNotificationForm) =>
      notifSvc.addNotification(user?.admin_id!, form),
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
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notifSvc.markAllAsRead(user?.admin_id!),
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
