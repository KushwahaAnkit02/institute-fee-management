import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { ClassRecord, SectionRecord } from "@/types/student";

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------
export async function getClasses(adminId: string): Promise<ClassRecord[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    admin_id: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    created_at: row.created_at as string,
  }));
}

export async function getClass(id: string): Promise<ClassRecord | null> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    admin_id: data.admin_id as string,
    name: data.name as string,
    description: (data.description ?? "") as string,
    created_at: data.created_at as string,
  };
}

export async function createClass(
  adminId: string,
  data: { name: string; description?: string },
): Promise<ClassRecord> {
  const { data: row, error } = await supabase
    .from("classes")
    .insert({
      admin_id: adminId,
      name: data.name,
      description: data.description ?? null,
    } as TablesInsert<"classes">)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Class creation returned no data");
  return {
    id: row.id as string,
    admin_id: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    created_at: row.created_at as string,
  };
}

export async function updateClass(
  id: string,
  data: { name: string; description?: string },
): Promise<ClassRecord> {
  const { data: row, error } = await supabase
    .from("classes")
    .update({
      name: data.name,
      description: data.description ?? null,
    } as TablesUpdate<"classes">)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Class update returned no data");
  return {
    id: row.id as string,
    admin_id: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    created_at: row.created_at as string,
  };
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export async function getSections(classId: string): Promise<SectionRecord[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    class_id: row.class_id as string,
    name: row.name as string,
    created_at: row.created_at as string,
  }));
}

export async function createSection(
  classId: string,
  data: { name: string },
): Promise<SectionRecord> {
  const { data: row, error } = await supabase
    .from("sections")
    .insert({ class_id: classId, name: data.name } as TablesInsert<"sections">)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Section creation returned no data");
  return {
    id: row.id as string,
    class_id: row.class_id as string,
    name: row.name as string,
    created_at: row.created_at as string,
  };
}

export async function updateSection(
  id: string,
  data: { name: string },
): Promise<SectionRecord> {
  const { data: row, error } = await supabase
    .from("sections")
    .update({ name: data.name } as TablesUpdate<"sections">)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Section update returned no data");
  return {
    id: row.id as string,
    class_id: row.class_id as string,
    name: row.name as string,
    created_at: row.created_at as string,
  };
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw error;
}
