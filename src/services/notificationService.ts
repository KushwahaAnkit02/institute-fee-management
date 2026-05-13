import { supabase } from "@/lib/supabase";
import type {
  CreateNotificationForm,
  Notification,
} from "@/types/notification";

export async function getNotifications(
  adminId: string,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Notification[];
}

export async function getNotificationsForStudent(
  studentId: string,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`student_id.eq.${studentId},student_id.is.null`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Notification[];
}

export async function addNotification(
  adminId: string,
  form: CreateNotificationForm,
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      admin_id: adminId,
      student_id: form.student_id || null,
      title: form.title,
      message: form.message,
      type: form.type,
      is_read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Notification;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllAsRead(adminId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("admin_id", adminId);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

export async function getUnreadCount(adminId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("admin_id", adminId)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}
