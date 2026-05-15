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
import {
  type ClassRecord,
  type CreateStudentForm,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  type Student,
  type SubjectRecord,
} from "@/types/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus, UserRoundPen } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const studentSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).refine((v) => !!v, {
    message: "Please select a gender",
  }),
  dob: z.string().optional(),
  address: z.string().optional(),
  enrollment_no: z.string().optional(),
  admission_date: z.string().optional(),
  monthly_fee: z
    .number({ message: "Monthly fee must be a number" })
    .positive("Monthly fee must be greater than 0"),
  status: z.string().min(1, "Please select a status"),
  class_id: z.string().min(1, "Please select a class"),
  subject_id: z.string().min(1, "Please select a subject"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (student: CreateStudentForm, tempPassword?: string) => void;
  student?: Student | null;
  adminId: string;
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  isLoading?: boolean;
}

export function StudentModal({
  open,
  onClose,
  onSuccess,
  student,
  classes,
  subjects,
  isLoading = false,
}: StudentModalProps) {
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: student?.full_name ?? "",
      email: student?.email ?? "",
      phone: student?.phone ?? "",
      gender: (student?.gender as "male" | "female" | "other") ?? undefined,
      dob: student?.dob ?? "",
      address: student?.address ?? "",
      enrollment_no: student?.enrollment_no ?? "",
      admission_date: student?.admission_date ?? "",
      monthly_fee: student?.monthly_fee ?? undefined,
      status: student?.status ?? "active",
      class_id: student?.class_id ?? "",
      subject_id: student?.subject_id ?? "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(values: StudentFormValues) {
    const formData: CreateStudentForm = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone ?? "",
      gender: values.gender,
      dob: values.dob ?? "",
      address: values.address ?? "",
      enrollment_no: values.enrollment_no ?? "",
      admission_date: values.admission_date ?? "",
      monthly_fee: values.monthly_fee,
      status: values.status,
      class_id: values.class_id,
      subject_id: values.subject_id,
    };
    // Pass undefined for edit mode — createStudent generates the temp password server-side
    // For new students, pass undefined too: the service generates and returns it in the response
    onSuccess(formData, undefined);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Gradient top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary to-accent rounded-t-lg" />

          <div className="px-6 pt-5 pb-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-display">
                {isEdit ? (
                  <UserRoundPen className="w-5 h-5 text-primary" />
                ) : (
                  <UserPlus className="w-5 h-5 text-primary" />
                )}
                {isEdit ? "Edit Student" : "Add New Student"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update student information below."
                  : "Fill in the details to add a new student. A temporary password will be generated."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-5">
              {/* Personal Info Section */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      placeholder="Rahul Sharma"
                      disabled={isLoading}
                      {...register("full_name")}
                      className={cn(errors.full_name && "border-destructive")}
                      data-ocid="student-modal.full_name_input"
                    />
                    {errors.full_name && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="student-modal.full_name_error"
                      >
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      disabled={isLoading || isEdit}
                      {...register("email")}
                      className={cn(errors.email && "border-destructive")}
                      data-ocid="student-modal.email_input"
                    />
                    {errors.email && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="student-modal.email_error"
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      disabled={isLoading}
                      {...register("phone")}
                      data-ocid="student-modal.phone_input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Gender *</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className={cn(
                              errors.gender && "border-destructive",
                            )}
                            data-ocid="student-modal.gender_select"
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-xs text-destructive">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      disabled={isLoading}
                      {...register("dob")}
                      data-ocid="student-modal.dob_input"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="123 Main St, City"
                      rows={2}
                      disabled={isLoading}
                      {...register("address")}
                      data-ocid="student-modal.address_textarea"
                    />
                  </div>
                </div>
              </section>

              {/* Academic Info */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Academic & Fee Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Class *</Label>
                    <Controller
                      name="class_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className={cn(
                              errors.class_id && "border-destructive",
                            )}
                            data-ocid="student-modal.class_select"
                          >
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.class_id && (
                      <p className="text-xs text-destructive">
                        {errors.class_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Subject *</Label>
                    <Controller
                      name="subject_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className={cn(
                              errors.subject_id && "border-destructive",
                            )}
                            data-ocid="student-modal.subject_select"
                          >
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subject_id && (
                      <p className="text-xs text-destructive">
                        {errors.subject_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="enrollment_no">Enrollment No.</Label>
                    <Input
                      id="enrollment_no"
                      placeholder="ENR-2024-001"
                      disabled={isLoading}
                      {...register("enrollment_no")}
                      data-ocid="student-modal.enrollment_no_input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admission_date">Admission Date</Label>
                    <Input
                      id="admission_date"
                      type="date"
                      disabled={isLoading}
                      {...register("admission_date")}
                      data-ocid="student-modal.admission_date_input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="monthly_fee">Monthly Fee (₹) *</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      min={0}
                      placeholder="1500"
                      disabled={isLoading}
                      {...register("monthly_fee", { valueAsNumber: true })}
                      className={cn(errors.monthly_fee && "border-destructive")}
                      data-ocid="student-modal.monthly_fee_input"
                    />
                    {errors.monthly_fee && (
                      <p className="text-xs text-destructive">
                        {errors.monthly_fee.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status *</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            className={cn(
                              errors.status && "border-destructive",
                            )}
                            data-ocid="student-modal.status_select"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && (
                      <p className="text-xs text-destructive">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-ocid="student-modal.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="student-modal.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
