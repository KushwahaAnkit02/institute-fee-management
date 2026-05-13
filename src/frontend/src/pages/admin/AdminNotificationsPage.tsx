import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddNotification,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { useStudents } from "@/hooks/useStudents";
import type {
  CreateNotificationForm,
  NotificationType,
} from "@/types/notification";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  Filter,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_META: Record<
  NotificationType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  reminder: {
    label: "Reminder",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  update: {
    label: "Update",
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  payment: {
    label: "Payment",
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
};

export function AdminNotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: students = [] } = useStudents();
  const addNotification = useAddNotification();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const [form, setForm] = useState<CreateNotificationForm>({
    title: "",
    message: "",
    type: "update",
    student_id: undefined,
  });
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");

  const unread = notifications.filter((n) => !n.is_read).length;

  const filtered =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const studentMap = new Map(students.map((s) => [s.id, s]));

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      await addNotification.mutateAsync(form);
      toast.success("Notification sent!");
      setForm({
        title: "",
        message: "",
        type: "update",
        student_id: undefined,
      });
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6"
        data-ocid="notifications.page"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              data-ocid="notifications.mark_all_read_button"
            >
              <Bell className="w-4 h-4 mr-2" /> Mark all as read
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Send Notification Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-foreground">
                  Send Notification
                </h3>
              </div>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, type: v as NotificationType }))
                    }
                  >
                    <SelectTrigger data-ocid="notifications.type_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>To (optional)</Label>
                  <Select
                    value={form.student_id ?? "all"}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        student_id: v === "all" ? undefined : v,
                      }))
                    }
                  >
                    <SelectTrigger data-ocid="notifications.recipient_select">
                      <Users className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="Notification title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    data-ocid="notifications.title_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={3}
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    data-ocid="notifications.message_input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-accent text-primary-foreground"
                  disabled={sending}
                  data-ocid="notifications.send_button"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3 space-y-3">
            {/* Type filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex gap-2 flex-wrap">
                {(["all", "update", "reminder", "alert"] as const).map(
                  (type) => {
                    const active = filterType === type;
                    const meta = type !== "all" ? TYPE_META[type] : null;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFilterType(type as NotificationType | "all")
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-fast border ${
                          active
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                        data-ocid={`notifications.filter_${type}.tab`}
                      >
                        {meta && (
                          <meta.icon
                            className={`w-3 h-3 ${active ? "text-primary" : meta.color}`}
                          />
                        )}
                        {type === "all" ? "All" : meta?.label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
              <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  All Notifications
                </h3>
                <span className="text-xs text-muted-foreground">
                  {filtered.length} total
                </span>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No notifications"
                  description="Send a notification to get started."
                  dataOcid="notifications.empty_state"
                />
              ) : (
                <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((notif, idx) => {
                      const meta = TYPE_META[notif.type];
                      const recipient = notif.student_id
                        ? studentMap.get(notif.student_id)
                        : null;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: Math.min(idx, 8) * 0.04 }}
                          className={`flex items-start gap-4 px-5 py-4 transition-fast ${!notif.is_read ? "bg-primary/5" : "hover:bg-muted/20"}`}
                          data-ocid={`notifications.item.${idx + 1}`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}
                          >
                            <meta.icon className={`w-4 h-4 ${meta.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`text-sm font-medium truncate ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {notif.title}
                              </p>
                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${meta.bg} ${meta.color} border-0`}
                                variant="secondary"
                              >
                                {meta.label}
                              </Badge>
                              {recipient && (
                                <span className="text-[10px] text-muted-foreground">
                                  → {recipient.name}
                                </span>
                              )}
                              {!notif.student_id && (
                                <span className="text-[10px] text-muted-foreground">
                                  → All Students
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              {new Date(notif.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notif.is_read && (
                              <button
                                type="button"
                                onClick={() => markAsRead.mutate(notif.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast"
                                aria-label="Mark as read"
                                data-ocid={`notifications.mark_read_button.${idx + 1}`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                deleteNotification.mutate(notif.id)
                              }
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast"
                              aria-label="Delete"
                              data-ocid={`notifications.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
