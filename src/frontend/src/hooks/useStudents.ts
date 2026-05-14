import * as studentSvc from "@/services/studentService";
import { getStudentByProfileId } from "@/services/studentService";
import { useAuthStore } from "@/store/authStore";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudents() {
  const admin = useAuthStore((s) => s.admin);
  const adminId = admin?.id;
  return useQuery<Student[]>({
    queryKey: ["students", adminId],
    queryFn: () => studentSvc.getStudents(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}

/** Student-scoped: fetches the student record linked to the current user's profile. */
/** Student-scoped: fetches the student record linked to the current user's profile. */
export function useMyStudentRecord() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  return useQuery<Student | null>({
    queryKey: ["student", "profile", user?.id],
    queryFn: () => (user?.id ? getStudentByProfileId(user.id) : null),
    enabled: !!user?.id && profile?.role === "student",
    staleTime: 0,
  });
}

export function useAddStudent() {
  const admin = useAuthStore((s) => s.admin);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateStudentForm) =>
      studentSvc.addStudent(admin?.id!, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentForm }) =>
      studentSvc.updateStudent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentSvc.deleteStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
