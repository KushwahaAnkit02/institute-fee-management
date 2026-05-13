import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyStudentRecord, useUpdateStudent } from "@/hooks/useStudents";
import { useTheme } from "@/hooks/useTheme";
import { linkStudentProfile } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Hash,
  IndianRupee,
  Link2,
  LogOut,
  Moon,
  Phone,
  Save,
  Sun,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ─── helpers ────────────────────────────────────────────────────────────────

function nameInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function nameColorClass(name: string): string {
  const hues = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-pink-600",
    "from-indigo-500 to-blue-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return hues[hash % hues.length];
}

// ─── schemas ────────────────────────────────────────────────────────────────

const editSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[+]?[0-9\-\s]{0,15}$/,
      "Enter a valid phone number (e.g. +91 99999 99999)",
    )
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Address too long").optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
});

type EditForm = z.infer<typeof editSchema>;

// ─── info row ────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-7 w-32 mb-1.5" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <Skeleton className="h-20 w-full" />
        <div className="p-6 pt-0">
          <div className="-mt-8 flex items-end gap-4 mb-5">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="mb-1 space-y-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, i) => i).map((i) => (
              <Skeleton key={`skeleton-${i}`} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const { user, logout } = useAuthStore();
  const { data: studentRecord, isLoading } = useMyStudentRecord();
  const { theme, setTheme } = useTheme();
  const updateStudent = useUpdateStudent();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [enrollCode, setEnrollCode] = useState("");
  const [linking, setLinking] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetEdit,
    formState: {
      errors: editErrors,
      isDirty: editDirty,
      isSubmitting: editSubmitting,
    },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: {
      phone: studentRecord?.phone ?? "",
      address: studentRecord?.address ?? "",
      dob: studentRecord?.dob ?? "",
    },
  });

  const initials = nameInitials(user?.name ?? "S");
  const avatarGradient = nameColorClass(user?.name ?? "S");
  const isLinked = !!studentRecord?.enrollmentNumber;

  async function onEditSubmit(data: EditForm) {
    if (!studentRecord) return;
    await updateStudent.mutateAsync({
      id: studentRecord.id,
      data: {
        phone: data.phone || undefined,
        address: data.address || undefined,
        dob: data.dob || undefined,
      },
    });
    await queryClient.invalidateQueries({ queryKey: ["student", "profile"] });
    toast.success("Profile updated successfully");
    setEditOpen(false);
  }

  async function handleLinkAccount() {
    if (!enrollCode.trim()) {
      toast.error("Please enter your enrollment code.");
      return;
    }
    setLinking(true);
    try {
      await linkStudentProfile(enrollCode.trim());
      await queryClient.invalidateQueries({ queryKey: ["student", "profile"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Account linked successfully!");
      setEnrollCode("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to link account.";
      toast.error(msg);
    } finally {
      setLinking(false);
    }
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="px-4 sm:px-6 py-6">
          <ProfileSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6 max-w-2xl"
        data-ocid="student-profile.page"
      >
        {/* Page heading */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your account information
          </p>
        </div>

        {/* ── Avatar + Info card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="rounded-2xl shadow-soft overflow-hidden border-border/60">
            {/* Gradient banner */}
            <div
              className={`h-20 bg-gradient-to-r ${avatarGradient} opacity-60`}
            />
            <CardContent className="px-5 sm:px-6 pb-6">
              <div className="-mt-10 flex flex-wrap items-end gap-4 mb-5">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-2xl font-bold text-white shadow-elevated border-2 border-background shrink-0`}
                >
                  {initials}
                </div>
                <div className="mb-1 min-w-0">
                  <h2 className="font-display text-xl font-bold text-foreground truncate">
                    {user?.name ?? "Student"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Role badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Student
                </Badge>
                {studentRecord?.class_ && (
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {studentRecord.class_}
                  </Badge>
                )}
                {studentRecord?.course && (
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    {studentRecord.course}
                  </Badge>
                )}
                {studentRecord?.section && (
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    Section {studentRecord.section}
                  </Badge>
                )}
              </div>

              {/* Stats grid */}
              {studentRecord && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoTile
                    icon={IndianRupee}
                    label="Monthly Fee"
                    value={`₹${studentRecord.monthly_fee.toLocaleString("en-IN")}`}
                  />
                  <InfoTile
                    icon={CalendarDays}
                    label="Joined"
                    value={new Date(
                      studentRecord.joined_date,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                  <InfoTile
                    icon={GraduationCap}
                    label="Status"
                    value={studentRecord.is_active ? "Active" : "Inactive"}
                    highlight={studentRecord.is_active}
                  />
                  {studentRecord.phone && (
                    <InfoTile
                      icon={Phone}
                      label="Phone"
                      value={studentRecord.phone}
                    />
                  )}
                  {studentRecord.enrollmentNumber && (
                    <InfoTile
                      icon={Hash}
                      label="Enrollment No."
                      value={studentRecord.enrollmentNumber}
                    />
                  )}
                  {studentRecord.admissionDate && (
                    <InfoTile
                      icon={CalendarDays}
                      label="Admission Date"
                      value={new Date(
                        studentRecord.admissionDate,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Enrollment code linking ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          data-ocid="student-profile.enrollment_section"
        >
          <AnimatePresence mode="wait">
            {isLinked ? (
              <motion.div
                key="linked"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 shadow-soft">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        Account Linked
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enrollment #{studentRecord?.enrollmentNumber}
                      </p>
                    </div>
                    <Badge className="ml-auto shrink-0 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Linked
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="unlinked"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-soft">
                  <CardHeader className="pb-3 pt-5 px-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">
                          Link Your Account
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enter the enrollment code provided by your institute
                          admin
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 sm:px-6 pb-5">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Rahul@4821"
                        value={enrollCode}
                        onChange={(e) => setEnrollCode(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleLinkAccount()
                        }
                        className="flex-1"
                        data-ocid="student-profile.enrollment_input"
                      />
                      <Button
                        type="button"
                        onClick={handleLinkAccount}
                        disabled={linking || !enrollCode.trim()}
                        className="shrink-0"
                        data-ocid="student-profile.link_button"
                      >
                        {linking ? (
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4 mr-1.5" />
                        )}
                        {linking ? "Linking…" : "Link Account"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Student details card ── */}
        {studentRecord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          >
            <Card className="rounded-2xl shadow-soft border-border/60">
              <CardHeader className="pb-2 pt-5 px-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base text-foreground">
                      Personal Details
                    </CardTitle>
                  </div>

                  {/* Edit dialog trigger */}
                  <Dialog
                    open={editOpen}
                    onOpenChange={(v) => {
                      setEditOpen(v);
                      if (v) resetEdit();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        data-ocid="student-profile.edit_button"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your contact details. Name, email, and academic
                          info are managed by the admin.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        id="edit-profile-form"
                        onSubmit={handleSubmit(onEditSubmit)}
                        className="space-y-4 py-2"
                        noValidate
                      >
                        {/* Read-only fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Name</Label>
                            <Input
                              value={studentRecord.name}
                              disabled
                              className="bg-muted/50 text-muted-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input
                              value={studentRecord.email}
                              disabled
                              className="bg-muted/50 text-muted-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Class</Label>
                            <Input
                              value={studentRecord.class_}
                              disabled
                              className="bg-muted/50 text-muted-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Course</Label>
                            <Input
                              value={studentRecord.course}
                              disabled
                              className="bg-muted/50 text-muted-foreground"
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Editable fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input
                              id="edit-phone"
                              placeholder="+91 99999 99999"
                              {...register("phone")}
                              className={
                                editErrors.phone ? "border-destructive" : ""
                              }
                              data-ocid="student-profile.phone_input"
                            />
                            {editErrors.phone && (
                              <p
                                className="text-xs text-destructive"
                                data-ocid="student-profile.phone_field_error"
                              >
                                {editErrors.phone.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit-dob">Date of Birth</Label>
                            <Input
                              id="edit-dob"
                              type="date"
                              {...register("dob")}
                              data-ocid="student-profile.dob_input"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edit-address">Address</Label>
                          <Input
                            id="edit-address"
                            placeholder="Your full address"
                            {...register("address")}
                            className={
                              editErrors.address ? "border-destructive" : ""
                            }
                            data-ocid="student-profile.address_input"
                          />
                          {editErrors.address && (
                            <p
                              className="text-xs text-destructive"
                              data-ocid="student-profile.address_field_error"
                            >
                              {editErrors.address.message}
                            </p>
                          )}
                        </div>
                      </form>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditOpen(false)}
                          data-ocid="student-profile.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          form="edit-profile-form"
                          disabled={!editDirty || editSubmitting}
                          className="gap-2"
                          data-ocid="student-profile.save_button"
                        >
                          {editSubmitting ? (
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent className="px-5 sm:px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow
                    icon={User}
                    label="Full Name"
                    value={studentRecord.name}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={studentRecord.phone}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Date of Birth"
                    value={
                      studentRecord.dob
                        ? new Date(studentRecord.dob).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : undefined
                    }
                  />
                  <InfoRow
                    icon={GraduationCap}
                    label="Gender"
                    value={studentRecord.gender}
                  />
                  <InfoRow
                    icon={BookOpen}
                    label="Address"
                    value={studentRecord.address}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Enrollment Number"
                    value={studentRecord.enrollmentNumber}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Parent / Guardian ── */}
        {(studentRecord?.parentName || studentRecord?.parentPhone) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
          >
            <Card className="rounded-2xl shadow-soft border-border/60">
              <CardHeader className="pb-2 pt-5 px-5 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base text-foreground">
                    Parent / Guardian
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 sm:px-6 pb-6">
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow
                    icon={User}
                    label="Guardian Name"
                    value={studentRecord?.parentName}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Guardian Phone"
                    value={studentRecord?.parentPhone}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Preferences ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-soft border-border/60">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sun className="w-4 h-4" />
                </div>
                <h2 className="font-display font-semibold text-foreground">
                  Preferences
                </h2>
              </div>
              <Separator className="mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Appearance
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Switch between dark and light mode
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    aria-label="Toggle theme"
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-primary"
                        : "bg-muted border border-border"
                    }`}
                    data-ocid="student-profile.theme_toggle"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200 ${
                        theme === "dark" ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Account / Logout ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
        >
          <Card className="rounded-2xl shadow-soft border-destructive/20">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                  <LogOut className="w-4 h-4" />
                </div>
                <h2 className="font-display font-semibold text-foreground">
                  Account
                </h2>
              </div>
              <Separator className="mb-4" />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Sign out
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You'll need to log in again to access the portal
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="gap-2 shrink-0"
                  data-ocid="student-profile.logout_button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}

// ─── InfoTile helper ──────────────────────────────────────────────────────────

function InfoTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-medium truncate ${
            highlight ? "text-emerald-600" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
