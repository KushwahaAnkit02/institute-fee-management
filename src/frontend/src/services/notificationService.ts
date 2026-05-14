import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
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
  return (data ?? []) as Notification[];
}

export async function getStudentNotifications(
  studentId: string,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`student_id.eq.${studentId},student_id.is.null`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}

// Legacy alias
export const getNotificationsForStudent = getStudentNotifications;

export async function createNotification(
  data: CreateNotificationForm & { admin_id: string },
): Promise<Notification> {
  const { data: row, error } = await supabase
    .from("notifications")
    .insert({
      admin_id: data.admin_id,
      student_id: data.student_id ?? null,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
    } as TablesInsert<"notifications">)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Notification creation returned no data");
  return row as Notification;
}

// Legacy alias used by existing pages
export async function addNotification(
  adminId: string,
  form: CreateNotificationForm,
): Promise<Notification> {
  return createNotification({ ...form, admin_id: adminId });
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as TablesUpdate<"notifications">)
    .eq("id", id);
  if (error) throw error;
}

export async function markAllAsRead(adminId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as TablesUpdate<"notifications">)
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
