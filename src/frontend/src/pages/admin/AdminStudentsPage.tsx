import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
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
import { Switch } from "@/components/ui/switch";
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
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  IndianRupee,
  Plus,
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
    <AnimatePresence>
      {open && student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-4 top-10 bottom-10 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-14 sm:bottom-auto sm:w-full sm:max-w-lg z-50 flex flex-col"
            data-ocid="student_details.dialog"
          >
            <div className="glass-card rounded-2xl shadow-elevated flex flex-col h-full sm:h-auto max-h-[calc(100vh-6rem)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                <h2 className="font-display font-semibold text-xl text-foreground">
                  Student Details
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-fast"
                  data-ocid="student_details.close_button"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0 bg-gradient-to-br ${avatarColor(student.name)}`}
                  >
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-foreground">
                      {student.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                  <Badge
                    className={`ml-auto ${student.is_active ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : "bg-muted text-muted-foreground"}`}
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
                      ["Monthly Fee", formatCurrency(student.monthly_fee)],
                      ["Joined", formatDate(student.joined_date)],
                      ["Fee Start", formatDate(student.fee_start_date)],
                      ["Enrolled On", formatDate(student.created_at)],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div key={label} className="bg-muted/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
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
                      <p className="text-xs text-muted-foreground">
                        Total Paid
                      </p>
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
              <div className="flex gap-3 px-6 py-4 border-t border-border/30">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- Add / Edit Student Modal ---------- */
interface StudentModalProps {
  open: boolean;
  student?: Student | null;
  onClose: () => void;
}

function StudentModal({ open, student, onClose }: StudentModalProps) {
  const isEdit = !!student;
  const addMutation = useAddStudent();
  const updateMutation = useUpdateStudent();

  const defaultForm: CreateStudentForm = {
    name: "",
    email: "",
    class_: "",
    course: "",
    monthly_fee: 0,
    joined_date: new Date().toISOString().split("T")[0],
    fee_start_date: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState<CreateStudentForm>(defaultForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateStudentForm, string>>
  >({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: defaultForm is stable inline literal
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
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [open, student]);

  function validate(): boolean {
    const e: Partial<Record<keyof CreateStudentForm, string>> = {};
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
        };
        await updateMutation.mutateAsync({ id: student.id, data: upd });
        toast.success("Student updated successfully!");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Student added successfully!");
      }
      onClose();
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
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-4 top-8 bottom-8 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-10 sm:bottom-auto sm:w-full sm:max-w-2xl z-50 flex flex-col"
            data-ocid="student_modal.dialog"
          >
            <div className="glass-card rounded-2xl shadow-elevated flex flex-col h-full sm:h-auto max-h-[calc(100vh-5rem)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                <div>
                  <h2 className="font-display font-semibold text-xl text-foreground">
                    {isEdit ? "Edit Student" : "Add New Student"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isEdit
                      ? "Update student details"
                      : "Fill in the student's information"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-fast w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
                  data-ocid="student_modal.close_button"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="s-name"
                      ref={firstInputRef}
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => field("name", e.target.value)}
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
                    <Label htmlFor="s-class">
                      Class <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="s-class"
                      placeholder="e.g. Class 10"
                      value={form.class_}
                      onChange={(e) => field("class_", e.target.value)}
                      className={errors.class_ ? "border-destructive" : ""}
                      data-ocid="student_modal.class_input"
                    />
                    {errors.class_ && (
                      <p className="text-xs text-destructive">
                        {errors.class_}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-course">
                      Course <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="s-course"
                      placeholder="e.g. Mathematics"
                      value={form.course}
                      onChange={(e) => field("course", e.target.value)}
                      className={errors.course ? "border-destructive" : ""}
                      data-ocid="student_modal.course_input"
                    />
                    {errors.course && (
                      <p className="text-xs text-destructive">
                        {errors.course}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-fee">
                      Monthly Fee (₹){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="s-fee"
                      type="number"
                      min={1}
                      placeholder="e.g. 1500"
                      value={form.monthly_fee || ""}
                      onChange={(e) =>
                        field("monthly_fee", Number(e.target.value))
                      }
                      className={errors.monthly_fee ? "border-destructive" : ""}
                      data-ocid="student_modal.fee_input"
                    />
                    {errors.monthly_fee && (
                      <p className="text-xs text-destructive">
                        {errors.monthly_fee}
                      </p>
                    )}
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
                      <p className="text-xs text-destructive">
                        {errors.joined_date}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="s-fee-start">
                      Fee Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="s-fee-start"
                      type="date"
                      value={form.fee_start_date}
                      onChange={(e) => field("fee_start_date", e.target.value)}
                      className={`${errors.fee_start_date ? "border-destructive" : ""} sm:max-w-xs`}
                      data-ocid="student_modal.fee_start_date_input"
                    />
                    {errors.fee_start_date && (
                      <p className="text-xs text-destructive">
                        {errors.fee_start_date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-8 pt-5 border-t border-border/30">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-fast ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page on filter change is intentional
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
                        { day: "2-digit", month: "short", year: "numeric" },
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
                        className={`text-xs shrink-0 ${student.is_active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-muted text-muted-foreground"}`}
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
                          className={`text-xs ${student.is_active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : ""}`}
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
      />
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
