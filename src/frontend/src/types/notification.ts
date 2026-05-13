export type NotificationType = "alert" | "reminder" | "update" | "payment";

export interface Notification {
  id: string;
  admin_id: string;
  student_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationForm {
  student_id?: string;
  title: string;
  message: string;
  type: NotificationType;
}
