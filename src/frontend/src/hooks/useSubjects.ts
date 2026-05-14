import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../queries/queryKeys";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../services/subjectService";
import { useAuthStore } from "../store/authStore";
import type { SubjectRecord } from "../types/student";

export function useSubjects() {
  const admin = useAuthStore((s) => s.admin);
  return useQuery<SubjectRecord[]>({
    queryKey: QUERY_KEYS.subjects(admin?.id ?? ""),
    queryFn: () => getSubjects(admin?.id ?? ""),
    enabled: !!admin?.id,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createSubject(admin?.id ?? "", data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.subjects(admin?.id ?? "") }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: { name: string; description?: string } }) =>
      updateSubject(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.subjects(admin?.id ?? "") }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.subjects(admin?.id ?? "") }),
  });
}
