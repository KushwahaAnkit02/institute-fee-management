import {
  createClass,
  createSection,
  deleteClass,
  deleteSection,
  getClasses,
  getSections,
  updateClass,
} from "@/services/classService";
import { useAuthStore } from "@/store/authStore";
import type {
  ClassRecord,
  CreateClassForm,
  CreateSectionForm,
  SectionRecord,
} from "@/types/student";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useClasses() {
  const adminId = useAuthStore((s) => s.admin?.id ?? "");
  return useQuery<ClassRecord[]>({
    queryKey: ["classes", adminId],
    queryFn: () => getClasses(adminId),
    enabled: !!adminId,
  });
}

export function useCreateClass() {
  const adminId = useAuthStore((s) => s.admin?.id ?? "");
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateClassForm) => createClass(adminId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create class");
    },
  });
}

export function useUpdateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: CreateClassForm }) =>
      updateClass(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update class");
    },
  });
}

export function useDeleteClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Class deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete class");
    },
  });
}

export function useSections(classId?: string) {
  return useQuery<SectionRecord[]>({
    queryKey: ["sections", classId],
    queryFn: () => getSections(classId ?? ""),
    enabled: !!classId,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateSectionForm) =>
      createSection(form.class_id, { name: form.name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section created");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create section");
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete section");
    },
  });
}
