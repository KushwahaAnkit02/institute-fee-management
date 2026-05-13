import { supabase } from "@/lib/supabase";
import type {
  ClassRecord,
  CreateClassForm,
  CreateSectionForm,
  SectionRecord,
} from "@/types/student";

export async function getClasses(): Promise<ClassRecord[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get admin record to filter by admin_id
  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (adminError) throw adminError;

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("admin_id", adminData.id)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    adminId: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    createdAt: row.created_at as string,
  }));
}

export async function createClass(form: CreateClassForm): Promise<ClassRecord> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (adminError) throw adminError;

  const { data, error } = await supabase
    .from("classes")
    .insert({
      admin_id: adminData.id,
      name: form.name,
      description: form.description,
    })
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id as string,
    adminId: data.admin_id as string,
    name: data.name as string,
    description: (data.description ?? "") as string,
    createdAt: data.created_at as string,
  };
}

export async function updateClass(
  id: string,
  form: CreateClassForm,
): Promise<void> {
  const { error } = await supabase
    .from("classes")
    .update({ name: form.name, description: form.description })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}

export async function getSections(classId?: string): Promise<SectionRecord[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (adminError) throw adminError;

  let query = supabase
    .from("sections")
    .select("*")
    .eq("admin_id", adminData.id)
    .order("created_at", { ascending: true });

  if (classId) {
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    classId: row.class_id as string,
    adminId: row.admin_id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  }));
}

export async function createSection(
  form: CreateSectionForm,
): Promise<SectionRecord> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (adminError) throw adminError;

  const { data, error } = await supabase
    .from("sections")
    .insert({ class_id: form.classId, admin_id: adminData.id, name: form.name })
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id as string,
    classId: data.class_id as string,
    adminId: data.admin_id as string,
    name: data.name as string,
    createdAt: data.created_at as string,
  };
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw error;
}
