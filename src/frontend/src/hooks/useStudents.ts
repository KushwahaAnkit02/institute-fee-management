import * as studentSvc from "@/services/studentService";
import { useAuthStore } from "@/store/authStore";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudents() {
  const user = useAuthStore((s) => s.user);
  const adminId = user?.admin_id;
  return useQuery<Student[]>({
    queryKey: ["students", adminId],
    queryFn: () => studentSvc.getStudents(adminId!),
    enabled: !!adminId,
    staleTime: 0,
  });
}

export function useAddStudent() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateStudentForm) =>
      studentSvc.addStudent(user?.admin_id!, form),
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
