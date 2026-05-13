import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdateStudent } from "@/hooks/useStudents";
import { useStudents } from "@/hooks/useStudents";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  IndianRupee,
  LogOut,
  Moon,
  Save,
  Sun,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name too long"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{0,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function StudentProfilePage() {
  const { user, login, logout } = useAuthStore();
  const { data: allStudents = [] } = useStudents();
  const { theme, setTheme } = useTheme();
  const updateStudent = useUpdateStudent();
  const studentRecord = allStudents.find((s) => s.id === user?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: "" },
  });

  // Sync defaults when user data loads
  useEffect(() => {
    if (user) reset({ name: user.name, phone: "" });
  }, [user, reset]);

  async function onSubmit(data: ProfileForm) {
    if (!user || !studentRecord) return;
    await new Promise((r) => setTimeout(r, 300));
    // Update auth store user name
    login({ ...user, name: data.name });
    // Update student record name
    updateStudent.mutate({ id: studentRecord.id, data: { name: data.name } });
    reset({ name: data.name, phone: data.phone ?? "" });
    toast.success("Profile updated successfully");
  }

  const initials = (user?.name ?? "S")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6 max-w-2xl"
        data-ocid="student-profile.page"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your account information
          </p>
        </div>

        {/* Avatar + Info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl shadow-soft overflow-hidden"
        >
          {/* Gradient banner */}
          <div className="h-20 gradient-accent opacity-70" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end gap-4 mb-5">
              <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-elevated border-2 border-background">
                {initials}
              </div>
              <div className="mb-1">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {user?.name ?? "Student"}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                <User className="w-3 h-3 mr-1" />
                Student
              </Badge>
              {studentRecord && (
                <>
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {studentRecord.class_}
                  </Badge>
                  <Badge className="bg-muted text-muted-foreground border-border text-xs">
                    {studentRecord.course}
                  </Badge>
                </>
              )}
            </div>

            {studentRecord && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    icon: IndianRupee,
                    label: "Monthly Fee",
                    value: `₹${studentRecord.monthly_fee.toLocaleString("en-IN")}`,
                  },
                  {
                    icon: CalendarDays,
                    label: "Joined Date",
                    value: new Date(
                      studentRecord.joined_date,
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  {
                    icon: GraduationCap,
                    label: "Status",
                    value: studentRecord.is_active ? "Active" : "Inactive",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-foreground">
              Edit Profile
            </h2>
          </div>
          <Separator className="mb-5" />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  placeholder="Your full name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                  data-ocid="student-profile.name_input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="student-profile.name_field_error"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  placeholder="+91 99999 99999"
                  {...register("phone")}
                  className={errors.phone ? "border-destructive" : ""}
                  data-ocid="student-profile.phone_input"
                />
                {errors.phone && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="student-profile.phone_field_error"
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={user?.email ?? ""}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              {studentRecord && (
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <Input
                    value={studentRecord.course}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Assigned by admin
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="gradient-accent text-primary-foreground gap-2"
                data-ocid="student-profile.save_button"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-foreground">
              Preferences
            </h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between dark and light mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
        </motion.div>

        {/* Account / Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
              <LogOut className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-foreground">
              Account
            </h2>
          </div>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
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
        </motion.div>
      </div>
    </PageTransition>
  );
}
