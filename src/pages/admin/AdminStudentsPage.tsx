import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageTransition } from "@/components/shared/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePaymentsByStudent } from "@/hooks/usePayments";
import {
  useAddStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "@/hooks/useStudents";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import {
  COURSE_OPTIONS,
  GENDER_OPTIONS,
  SECTION_OPTIONS,
} from "@/types/student";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  Eye,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type FilterStatus = "all" | "active" | "inactive";
type SortKey = "name" | "monthly_fee" | "joined_date";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateEnrollmentCode(firstName: string): string {
  const clean = firstName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `AC-${clean}${digits}`;
}

/* ---------- Student Created Credentials Modal ---------- */
function CredentialsModal({
  open,
  onClose,
  studentName,
  email,
  enrollmentCode,
}: {
  open: boolean;
  onClose: () => void;
  studentName: string;
  email: string;
  enrollmentCode: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(enrollmentCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Enrollment code copied!");
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="credentials.dialog">
        <div className="flex flex-col items-center text-center pt-2 pb-4 space-y-5">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 300 }}
            className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-emerald-500" />
          </motion.div>

          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-foreground">
              Student Created!
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{studentName}</span>{" "}
              has been added to the system.
            </p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>

          <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Enrollment Code
            </p>
            <p
              className="font-display text-3xl font-bold text-primary tracking-widest"
              data-ocid="credentials.enrollment_code"
            >
              {enrollmentCode}
            </p>
            <p className="text-xs text-muted-foreground">
              Share this code with the student so they can log in to the portal.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
              onClick={copyCode}
              data-ocid="credentials.copy_button"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Code
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="pt-0 pb-2">
          <Button
            type="button"
            className="w-full gradient-accent text-primary-foreground"
            onClick={onClose}
            data-ocid="credentials.done_button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Student Details Modal ---------- */
function StudentDetailsModal({
  student,
  open,
  onClose,
  onEdit,
}: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { data: payments = [] } = usePaymentsByStudent(student?.id ?? "");
  const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
  const pendingBalance = student
    ? Math.max(0, student.monthly_fee - totalPaid)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        data-ocid="student_details.dialog"
      >
        {student && (
          <>
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pb-2">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0 bg-gradient-to-br ${avatarColor(student.name)}`}
                >
                  {getInitials(student.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-bold text-foreground">
                    {student.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  {student.enrollmentNumber && (
                    <p className="text-xs text-primary font-mono font-medium mt-0.5">
                      {student.enrollmentNumber}
                    </p>
                  )}
                </div>
                <Badge
                  className={`shrink-0 ${
                    student.is_active
                      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                  variant={student.is_active ? "default" : "secondary"}
                >
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["Class", student.class_],
                    ["Course", student.course],
                    ["Section", student.section || "—"],
                    ["Gender", student.gender || "—"],
                    ["Monthly Fee", formatCurrency(student.monthly_fee)],
                    ["Joined", formatDate(student.joined_date)],
                    ["Fee Start", formatDate(student.fee_start_date)],
                    ["Phone", student.phone || "—"],
                    ["Parent", student.parentName || "—"],
                    ["Parent Phone", student.parentPhone || "—"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="bg-muted/30 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-primary" /> Payment
                  Summary
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-lg font-bold text-primary">
                      {formatCurrency(totalPaid)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-amber-500">
                      {formatCurrency(pendingBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">
                      {payments.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Payments</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-ocid="student_details.cancel_button"
              >
                Close
              </Button>
              <Button
                className="flex-1 gradient-accent text-primary-foreground"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                data-ocid="student_details.edit_button"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Student
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Form Section Heading ---------- */
function FormSection({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="pt-4 pb-1">
      <p className="font-display font-semibold text-sm text-foreground">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
      <Separator className="mt-2" />
    </div>
  );
}

/* ---------- Add / Edit Student Dialog ---------- */
interface StudentModalProps {
  open: boolean;
  student?: Student | null;
  onClose: () => void;
  onCreated?: (name: string, email: string, code: string) => void;
}

function StudentModal({
  open,
  student,
  onClose,
  onCreated,
}: StudentModalProps) {
  const isEdit = !!student;
  const addMutation = useAddStudent();
  const updateMutation = useUpdateStudent();

  const today = new Date().toISOString().split("T")[0];

  const defaultForm: CreateStudentForm = {
    name: "",
    email: "",
    class_: "",
    course: "",
    monthly_fee: 0,
    joined_date: today,
    fee_start_date: today,
    phone: "",
    gender: "",
    dob: "",
    address: "",
    parentName: "",
    parentPhone: "",
    section: "",
    enrollmentNumber: "",
    admissionDate: today,
  };

  const [form, setForm] = useState<CreateStudentForm>(defaultForm);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on open
  useEffect(() => {
    if (!open) return;
    if (student) {
      setForm({
        name: student.name,
        email: student.email,
        class_: student.class_,
        course: student.course,
        monthly_fee: student.monthly_fee,
        joined_date: student.joined_date,
        fee_start_date: student.fee_start_date,
        phone: student.phone ?? "",
        gender: student.gender ?? "",
        dob: student.dob ?? "",
        address: student.address ?? "",
        parentName: student.parentName ?? "",
        parentPhone: student.parentPhone ?? "",
        section: student.section ?? "",
        enrollmentNumber: student.enrollmentNumber ?? "",
        admissionDate: student.admissionDate ?? today,
      });
      setIsActive(student.is_active);
    } else {
      setForm({
        ...defaultForm,
        enrollmentNumber: generateEnrollmentCode("New"),
      });
      setIsActive(true);
    }
    setErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [open, student]);

  // Auto-regenerate enrollment code when name changes (new student only)
  function handleNameChange(val: string) {
    setForm((prev) => ({
      ...prev,
      name: val,
      enrollmentNumber:
        !isEdit && prev.enrollmentNumber
          ? generateEnrollmentCode(val || "New")
          : prev.enrollmentNumber,
    }));
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
  }

  function handlePhoneInput(val: string, field: "phone" | "parentPhone") {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, [field]: digits }));
  }

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.class_.trim()) e.class_ = "Class is required";
    if (!form.course.trim()) e.course = "Course is required";
    if (!form.monthly_fee || form.monthly_fee <= 0)
      e.monthly_fee = "Fee must be > 0";
    if (!form.joined_date) e.joined_date = "Required";
    if (!form.fee_start_date) e.fee_start_date = "Required";
    if (form.phone && form.phone.length !== 10)
      e.phone = "Enter 10-digit mobile number";
    if (form.parentPhone && form.parentPhone.length !== 10)
      e.parentPhone = "Enter 10-digit number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit && student) {
        const upd: UpdateStudentForm = {
          name: form.name,
          email: form.email,
          class_: form.class_,
          course: form.course,
          monthly_fee: form.monthly_fee,
          phone: form.phone,
          gender: form.gender,
          dob: form.dob,
          address: form.address,
          parentName: form.parentName,
          parentPhone: form.parentPhone,
          section: form.section,
          enrollmentNumber: form.enrollmentNumber,
          admissionDate: form.admissionDate,
          is_active: isActive,
        };
        await updateMutation.mutateAsync({ id: student.id, data: upd });
        toast.success("Student updated successfully!");
        onClose();
      } else {
        await addMutation.mutateAsync(form);
        const code = form.enrollmentNumber ?? "";
        onClose();
        onCreated?.(form.name, form.email, code);
      }
    } catch {
      toast.error(
        isEdit ? "Failed to update student" : "Failed to add student",
      );
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending;

  function field<K extends keyof CreateStudentForm>(
    key: K,
    value: CreateStudentForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string])
      setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="student_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update student details below."
              : "Fill in the student information to create their account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1 pb-2">
          {/* ── Section 1: Personal Info ── */}
          <FormSection
            title="Personal Information"
            subtitle="Basic student identity details"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s-name"
                ref={firstInputRef}
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
                data-ocid="student_modal.name_input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="student_modal.name_error"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s-email"
                type="email"
                placeholder="student@email.com"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
                data-ocid="student_modal.email_input"
              />
              {errors.email && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="student_modal.email_error"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Phone Number</Label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted/50 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="s-phone"
                  placeholder="9876543210"
                  value={form.phone ?? ""}
                  onChange={(e) => handlePhoneInput(e.target.value, "phone")}
                  className={`rounded-l-none ${
                    errors.phone ? "border-destructive" : ""
                  }`}
                  maxLength={10}
                  inputMode="numeric"
                  data-ocid="student_modal.phone_input"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-gender">Gender</Label>
              <Select
                value={form.gender ?? ""}
                onValueChange={(v) => field("gender", v)}
              >
                <SelectTrigger
                  id="s-gender"
                  data-ocid="student_modal.gender_select"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-dob">Date of Birth</Label>
              <Input
                id="s-dob"
                type="date"
                value={form.dob ?? ""}
                onChange={(e) => field("dob", e.target.value)}
                data-ocid="student_modal.dob_input"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-address">Address</Label>
              <Textarea
                id="s-address"
                placeholder="Full residential address"
                value={form.address ?? ""}
                onChange={(e) => field("address", e.target.value)}
                className="resize-none min-h-[72px]"
                data-ocid="student_modal.address_input"
              />
            </div>
          </div>

          {/* ── Section 2: Parent / Guardian ── */}
          <FormSection
            title="Parent / Guardian"
            subtitle="Emergency and guardian contact information"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-parent-name">Parent / Guardian Name</Label>
              <Input
                id="s-parent-name"
                placeholder="e.g. Ramesh Sharma"
                value={form.parentName ?? ""}
                onChange={(e) => field("parentName", e.target.value)}
                data-ocid="student_modal.parent_name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-parent-phone">Parent Phone</Label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted/50 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="s-parent-phone"
                  placeholder="9876543210"
                  value={form.parentPhone ?? ""}
                  onChange={(e) =>
                    handlePhoneInput(e.target.value, "parentPhone")
                  }
                  className={`rounded-l-none ${
                    errors.parentPhone ? "border-destructive" : ""
                  }`}
                  maxLength={10}
                  inputMode="numeric"
                  data-ocid="student_modal.parent_phone_input"
                />
              </div>
              {errors.parentPhone && (
                <p className="text-xs text-destructive">{errors.parentPhone}</p>
              )}
            </div>
          </div>

          {/* ── Section 3: Academic Info ── */}
          <FormSection
            title="Academic Information"
            subtitle="Course, class and enrollment details"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-course">
                Course / Class <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.course}
                onValueChange={(v) => {
                  field("course", v);
                  field("class_", v);
                }}
              >
                <SelectTrigger
                  id="s-course"
                  className={errors.course ? "border-destructive" : ""}
                  data-ocid="student_modal.course_select"
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {COURSE_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-xs text-destructive">{errors.course}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-section">Section</Label>
              <Select
                value={form.section ?? ""}
                onValueChange={(v) => field("section", v)}
              >
                <SelectTrigger
                  id="s-section"
                  data-ocid="student_modal.section_select"
                >
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-enrollment">Enrollment Number</Label>
              <div className="flex gap-2">
                <Input
                  id="s-enrollment"
                  value={form.enrollmentNumber ?? ""}
                  readOnly
                  className="flex-1 font-mono text-sm bg-muted/30"
                  data-ocid="student_modal.enrollment_input"
                />
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      field(
                        "enrollmentNumber",
                        generateEnrollmentCode(form.name || "New"),
                      )
                    }
                    title="Regenerate code"
                    data-ocid="student_modal.regenerate_code_button"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-admission">Admission Date</Label>
              <Input
                id="s-admission"
                type="date"
                value={form.admissionDate ?? ""}
                onChange={(e) => field("admissionDate", e.target.value)}
                data-ocid="student_modal.admission_date_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-joined">
                Joined Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s-joined"
                type="date"
                value={form.joined_date}
                onChange={(e) => field("joined_date", e.target.value)}
                className={errors.joined_date ? "border-destructive" : ""}
                data-ocid="student_modal.joined_date_input"
              />
              {errors.joined_date && (
                <p className="text-xs text-destructive">{errors.joined_date}</p>
              )}
            </div>
          </div>

          {/* ── Section 4: Financial ── */}
          <FormSection
            title="Financial Details"
            subtitle="Fee amount and billing period"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-fee">
                Monthly Fee (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s-fee"
                type="number"
                min={1}
                placeholder="e.g. 1500"
                value={form.monthly_fee || ""}
                onChange={(e) => field("monthly_fee", Number(e.target.value))}
                className={errors.monthly_fee ? "border-destructive" : ""}
                data-ocid="student_modal.fee_input"
              />
              {errors.monthly_fee && (
                <p className="text-xs text-destructive">{errors.monthly_fee}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-fee-start">
                Fee Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="s-fee-start"
                type="date"
                value={form.fee_start_date}
                onChange={(e) => field("fee_start_date", e.target.value)}
                className={errors.fee_start_date ? "border-destructive" : ""}
                data-ocid="student_modal.fee_start_date_input"
              />
              {errors.fee_start_date && (
                <p className="text-xs text-destructive">
                  {errors.fee_start_date}
                </p>
              )}
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={isActive ? "Active" : "Inactive"}
                  onValueChange={(v) => setIsActive(v === "Active")}
                >
                  <SelectTrigger data-ocid="student_modal.status_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-6 mt-2 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
              data-ocid="student_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-accent text-primary-foreground"
              disabled={isPending}
              data-ocid="student_modal.submit_button"
            >
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                  ? "Save Changes"
                  : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-fast ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <SortAsc className="w-3 h-3" />
        ) : (
          <SortDesc className="w-3 h-3" />
        )
      ) : (
        <SortAsc className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {["a", "b", "c", "d", "e"].map((key, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/30"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-20 hidden sm:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </motion.div>
      ))}
    </div>
  );
}

export function AdminStudentsPage() {
  const { data: students = [], isLoading } = useStudents();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Student | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    code: string;
  } | null>(null);

  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const filtered = useMemo(() => {
    let list = [...students];
    const q = search.toLowerCase().trim();
    if (q)
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.class_.toLowerCase().includes(q),
      );
    if (filterStatus === "active") list = list.filter((s) => s.is_active);
    if (filterStatus === "inactive") list = list.filter((s) => !s.is_active);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      if (sortKey === "monthly_fee") cmp = a.monthly_fee - b.monthly_fee;
      if (sortKey === "joined_date")
        cmp =
          new Date(a.joined_date).getTime() - new Date(b.joined_date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [students, search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function doToggle(student: Student, activate: boolean) {
    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: { is_active: activate },
      });
      toast.success(
        activate
          ? `${student.name} activated.`
          : `${student.name} deactivated.`,
      );
    } catch {
      toast.error("Failed to update student status");
    }
  }

  async function doDelete(student: Student) {
    try {
      await deleteMutation.mutateAsync(student.id);
      toast.success(`${student.name} deleted.`);
    } catch {
      toast.error("Failed to delete student");
    }
  }

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 py-6 space-y-6" data-ocid="students.page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Students
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading..."
                : `${filtered.length} student${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditStudent(null);
              setModalOpen(true);
            }}
            className="gradient-accent text-primary-foreground shadow-soft shrink-0"
            data-ocid="students.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Student
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email or class…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/60"
              data-ocid="students.search_input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as FilterStatus)}
          >
            <SelectTrigger
              className="w-full sm:w-44 bg-card/60"
              data-ocid="students.filter.select"
            >
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-soft">
          <div className="hidden md:grid grid-cols-[2.5rem_1fr_1.2fr_0.8fr_0.8fr_0.9fr_5.5rem_7rem] gap-3 px-5 py-3 border-b border-border/30 bg-muted/20">
            <div />
            <SortHeader
              label="Name"
              sortKey="name"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class
            </span>
            <SortHeader
              label="Fee"
              sortKey="monthly_fee"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortHeader
              label="Joined"
              sortKey="joined_date"
              current={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </span>
          </div>
          <div className="divide-y divide-border/20">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton />
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState
                icon={Users}
                title={
                  search || filterStatus !== "all"
                    ? "No matching students"
                    : "No students yet"
                }
                description={
                  search || filterStatus !== "all"
                    ? "Try adjusting your search or filter."
                    : "Add your first student to get started."
                }
                actionLabel={
                  !search && filterStatus === "all" ? "Add Student" : undefined
                }
                onAction={
                  !search && filterStatus === "all"
                    ? () => setModalOpen(true)
                    : undefined
                }
                dataOcid="students.empty_state"
              />
            ) : (
              <AnimatePresence mode="wait">
                {paginated.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{
                      delay: Math.min(idx, 8) * 0.04,
                      duration: 0.25,
                    }}
                    className="group grid grid-cols-[auto_1fr] md:grid-cols-[2.5rem_1fr_1.2fr_0.8fr_0.8fr_0.9fr_5.5rem_7rem] gap-3 items-center px-5 py-3.5 hover:bg-muted/20 transition-fast cursor-pointer"
                    onClick={() => {
                      setViewStudent(student);
                      setDetailsOpen(true);
                    }}
                    data-ocid={`students.item.${idx + 1 + (page - 1) * PAGE_SIZE}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br ${avatarColor(student.name)}`}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-fast">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate md:hidden">
                        {student.email}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {student.class_} · {student.course} · ₹
                        {student.monthly_fee.toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                    <p className="hidden md:block text-sm text-muted-foreground truncate min-w-0">
                      {student.email}
                    </p>
                    <div className="hidden md:block">
                      <p className="text-sm text-foreground truncate">
                        {student.class_}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.course}
                      </p>
                    </div>
                    <p className="hidden md:block text-sm font-medium text-foreground">
                      ₹{student.monthly_fee.toLocaleString("en-IN")}
                    </p>
                    <p className="hidden md:block text-xs text-muted-foreground">
                      {new Date(student.joined_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                    <div
                      className="hidden md:flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Switch
                        checked={student.is_active}
                        onCheckedChange={(v) => {
                          if (!v) {
                            setToggleTarget(student);
                            setToggleConfirm(true);
                          } else doToggle(student, true);
                        }}
                        aria-label={`Toggle ${student.name}`}
                        data-ocid={`students.toggle.${idx + 1}`}
                      />
                      <Badge
                        variant={student.is_active ? "default" : "secondary"}
                        className={`text-xs shrink-0 ${
                          student.is_active
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div
                      className="hidden md:flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setViewStudent(student);
                          setDetailsOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast"
                        data-ocid={`students.view_button.${idx + 1}`}
                        aria-label={`View ${student.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditStudent(student);
                          setModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-fast opacity-0 group-hover:opacity-100"
                        data-ocid={`students.edit_button.${idx + 1}`}
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(student);
                          setConfirmOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-fast opacity-0 group-hover:opacity-100"
                        data-ocid={`students.delete_button.${idx + 1}`}
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className="md:hidden col-span-2 flex items-center justify-between pt-2 border-t border-border/20"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={student.is_active}
                          onCheckedChange={(v) => {
                            if (!v) {
                              setToggleTarget(student);
                              setToggleConfirm(true);
                            } else doToggle(student, true);
                          }}
                          aria-label={`Toggle ${student.name}`}
                        />
                        <Badge
                          variant={student.is_active ? "default" : "secondary"}
                          className={`text-xs ${
                            student.is_active
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : ""
                          }`}
                        >
                          {student.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditStudent(student);
                            setModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-fast"
                          data-ocid={`students.edit_button.${idx + 1}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(student);
                            setConfirmOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-fast"
                          data-ocid={`students.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="students.pagination_prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="students.pagination_next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StudentDetailsModal
        student={viewStudent}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setViewStudent(null);
        }}
        onEdit={() => {
          setEditStudent(viewStudent);
          setModalOpen(true);
        }}
      />
      <StudentModal
        open={modalOpen}
        student={editStudent}
        onClose={() => {
          setModalOpen(false);
          setEditStudent(null);
        }}
        onCreated={(name, email, code) => setCredentials({ name, email, code })}
      />
      {credentials && (
        <CredentialsModal
          open={!!credentials}
          studentName={credentials.name}
          email={credentials.email}
          enrollmentCode={credentials.code}
          onClose={() => setCredentials(null)}
        />
      )}
      <ConfirmModal
        open={toggleConfirm}
        title="Deactivate Student?"
        description={`This will mark ${toggleTarget?.name ?? "this student"} as inactive.`}
        confirmLabel="Deactivate"
        variant="warning"
        onConfirm={async () => {
          if (toggleTarget) {
            setToggleConfirm(false);
            await doToggle(toggleTarget, false);
            setToggleTarget(null);
          }
        }}
        onCancel={() => {
          setToggleConfirm(false);
          setToggleTarget(null);
        }}
        isLoading={updateMutation.isPending}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Delete Student?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this student"} and all their data.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) {
            setConfirmOpen(false);
            await doDelete(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        isLoading={deleteMutation.isPending}
      />
    </PageTransition>
  );
}
