import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  CreateNotificationForm,
  NotificationType,
} from "@/types/notification";
import type { Student } from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: "alert", label: "Alert" },
  { value: "reminder", label: "Reminder" },
  { value: "update", label: "Update" },
  { value: "payment", label: "Payment" },
];

const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  type: z.enum(["alert", "reminder", "update", "payment"]).refine((v) => !!v, {
    message: "Please select a notification type",
  }),
  recipient: z.enum(["all", "specific"]),
  student_id: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (notification: CreateNotificationForm) => void;
  adminId: string;
  students: Student[];
  isLoading?: boolean;
}

export function NotificationModal({
  open,
  onClose,
  onSuccess,
  students,
  isLoading = false,
}: NotificationModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: undefined,
      recipient: "all",
      student_id: "",
    },
  });

  const recipient = useWatch({ control, name: "recipient" });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: NotificationFormValues) {
    const form: CreateNotificationForm = {
      title: values.title,
      message: values.message,
      type: values.type,
      student_id:
        values.recipient === "specific" && values.student_id
          ? values.student_id
          : undefined,
    };
    onSuccess(form);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary to-accent rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                <Bell className="w-5 h-5 text-primary" />
                Send Notification
              </DialogTitle>
              <DialogDescription>
                Send a notification to all students or a specific student.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notif-title">Title *</Label>
                <Input
                  id="notif-title"
                  placeholder="Fee Reminder — January 2025"
                  disabled={isLoading}
                  {...register("title")}
                  className={cn(errors.title && "border-destructive")}
                  data-ocid="notification-modal.title_input"
                />
                {errors.title && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="notification-modal.title_error"
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notif-message">Message *</Label>
                <Textarea
                  id="notif-message"
                  placeholder="Your fee for this month is due. Please pay at the earliest."
                  rows={3}
                  disabled={isLoading}
                  {...register("message")}
                  className={cn(errors.message && "border-destructive")}
                  data-ocid="notification-modal.message_textarea"
                />
                {errors.message && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="notification-modal.message_error"
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={cn(errors.type && "border-destructive")}
                        data-ocid="notification-modal.type_select"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTIFICATION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Recipient toggle */}
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-3">
                  <Controller
                    name="recipient"
                    control={control}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          onClick={() => field.onChange("all")}
                          disabled={isLoading}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-fast",
                            field.value === "all"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50",
                          )}
                          data-ocid="notification-modal.recipient_all_toggle"
                        >
                          All Students
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("specific")}
                          disabled={isLoading}
                          className={cn(
                            "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-fast",
                            field.value === "specific"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50",
                          )}
                          data-ocid="notification-modal.recipient_specific_toggle"
                        >
                          Specific Student
                        </button>
                      </>
                    )}
                  />
                </div>
              </div>

              {/* Student select (conditional) */}
              {recipient === "specific" && (
                <div className="space-y-1.5">
                  <Label>Select Student *</Label>
                  <Controller
                    name="student_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger data-ocid="notification-modal.student_select">
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="notification-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="notification-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...
                  </>
                ) : (
                  "Send Notification"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
