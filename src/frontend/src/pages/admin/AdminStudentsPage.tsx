import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  User2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "../../components/modals/ConfirmModal";
import { CredentialModal } from "../../components/modals/CredentialModal";
import { StudentModal } from "../../components/modals/StudentModal";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { useClasses } from "../../hooks/useClasses";
import {
  useAddStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "../../hooks/useStudents";
import { useSubjects } from "../../hooks/useSubjects";
import { useAuthStore } from "../../store/authStore";
import type {
  ClassRecord,
  CreateStudentForm,
  Student,
  SubjectRecord,
} from "../../types/student";

const PAGE_SIZE = 10;

interface CredentialData {
  name: string;
  email: string;
  tempPassword: string;
}

export default function AdminStudentsPage() {
  const admin = useAuthStore((s) => s.admin);
  const adminId = admin?.id ?? "";

  const { data: students = [], isLoading } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();

  const addStudentMutation = useAddStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [credentialData, setCredentialData] = useState<CredentialData | null>(
    null,
  );

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Filtered + paginated data
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchClass = classFilter === "all" || s.class_id === classFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [students, search, statusFilter, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatusFilter = (v: string) => {
    setStatusFilter(v as "all" | "active" | "inactive");
    setPage(1);
  };
  const handleClassFilter = (v: string) => {
    setClassFilter(v);
    setPage(1);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSuccess = async (
    formData: CreateStudentForm,
    _tempPassword?: string,
  ) => {
    try {
      const result = await addStudentMutation.mutateAsync(formData);
      setCredentialData({
        name: result.full_name,
        email: result.email,
        tempPassword: result.generated_temp_password,
      });
      setShowAddModal(false);
      setShowCredentialModal(true);
      toast.success("Student added successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add student";
      toast.error(msg);
    }
  };

  const handleEditSuccess = async (
    formData: CreateStudentForm,
    _tempPassword?: string,
  ) => {
    if (!selectedStudent) return;
    try {
      await updateStudentMutation.mutateAsync({
        id: selectedStudent.id,
        data: formData,
      });
      setShowEditModal(false);
      setSelectedStudent(null);
      toast.success("Student updated successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update student";
      toast.error(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      toast.success("Student deleted");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete student";
      toast.error(msg);
    }
  };

  const openEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const openDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const getClassName = (classId: string) =>
    (classes as ClassRecord[]).find((c) => c.id === classId)?.name ?? "—";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Students
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage all enrolled students — add, edit, or remove records.
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  data-ocid="students.search_input"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger
                  data-ocid="students.status_filter"
                  className="w-full md:w-36"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Class filter */}
              <Select value={classFilter} onValueChange={handleClassFilter}>
                <SelectTrigger
                  data-ocid="students.class_filter"
                  className="w-full md:w-44"
                >
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {(classes as ClassRecord[]).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add button */}
            <Button
              data-ocid="students.add_button"
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="px-4 py-3 md:px-6">
          <CardTitle className="text-base font-medium">
            {isLoading
              ? "Loading…"
              : `${filtered.length} student${filtered.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Full Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Class</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Monthly Fee
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  ["r0", "r1", "r2", "r3", "r4", "r5"].map((rowId) => (
                    <tr key={rowId} className="border-b last:border-0">
                      {["c0", "c1", "c2", "c3", "c4", "c5", "c6"].map(
                        (colId) => (
                          <td key={colId} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div
                        data-ocid="students.empty_state"
                        className="flex flex-col items-center gap-3 text-muted-foreground"
                      >
                        <User2 className="h-10 w-10 opacity-40" />
                        <p className="text-base font-medium">
                          {search ||
                          statusFilter !== "all" ||
                          classFilter !== "all"
                            ? "No students match your filters."
                            : "No students yet. Add your first student."}
                        </p>
                        {!search &&
                          statusFilter === "all" &&
                          classFilter === "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddModal(true)}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add Student
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence initial={false}>
                    {paginated.map((student, idx) => {
                      const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                      return (
                        <motion.tr
                          key={student.id}
                          data-ocid={`students.item.${rowNum}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.03 }}
                          className="border-b last:border-0 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {rowNum}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            <span className="truncate max-w-[160px] block">
                              {student.full_name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="truncate max-w-[180px] block">
                              {student.email}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getClassName(student.class_id)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            ₹{student.monthly_fee.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            {student.status === "active" ? (
                              <Badge
                                data-ocid={`students.status.${rowNum}`}
                                variant="default"
                                className="bg-green-500/15 text-green-700 border-green-500/20 hover:bg-green-500/20 dark:text-green-400"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                data-ocid={`students.status.${rowNum}`}
                                variant="secondary"
                              >
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                data-ocid={`students.edit_button.${rowNum}`}
                                onClick={() => openEdit(student)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  Edit {student.full_name}
                                </span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                data-ocid={`students.delete_button.${rowNum}`}
                                onClick={() => openDelete(student)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  Delete {student.full_name}
                                </span>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {filtered.length} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  data-ocid="students.pagination_prev"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  data-ocid="students.pagination_next"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Modals ─────────────────────────────────────────────────────── */}

      {/* Add Student */}
      <StudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        adminId={adminId}
        classes={classes as ClassRecord[]}
        subjects={(subjects ?? []) as SubjectRecord[]}
      />

      {/* Edit Student */}
      {selectedStudent && (
        <StudentModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleEditSuccess}
          student={selectedStudent}
          adminId={adminId}
          classes={classes as ClassRecord[]}
          subjects={(subjects ?? []) as SubjectRecord[]}
        />
      )}

      {/* Credential display after add */}
      {credentialData && (
        <CredentialModal
          open={showCredentialModal}
          onClose={() => {
            setShowCredentialModal(false);
            setCredentialData(null);
          }}
          studentName={credentialData.name}
          email={credentialData.email}
          tempPassword={credentialData.tempPassword}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.full_name ?? "this student"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteStudentMutation.isPending}
      />
    </div>
  );
}
