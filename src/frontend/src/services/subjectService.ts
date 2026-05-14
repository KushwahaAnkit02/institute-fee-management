import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { SubjectRecord } from "@/types/student";

export async function getSubjects(adminId: string): Promise<SubjectRecord[]> {
  const { data, error } = await supabase
    .from("subjects")
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
    updated_at: row.updated_at as string,
  }));
}

export async function createSubject(
  adminId: string,
  data: { name: string; description?: string },
): Promise<SubjectRecord> {
  const { data: row, error } = await supabase
    .from("subjects")
    .insert({
      admin_id: adminId,
      name: data.name,
      description: data.description ?? null,
    } as TablesInsert<"subjects">)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Subject creation returned no data");
  return {
    id: row.id as string,
    admin_id: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function updateSubject(
  id: string,
  data: { name: string; description?: string },
): Promise<SubjectRecord> {
  const { data: row, error } = await supabase
    .from("subjects")
    .update({
      name: data.name,
      description: data.description ?? null,
    } as TablesUpdate<"subjects">)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Subject update returned no data");
  return {
    id: row.id as string,
    admin_id: row.admin_id as string,
    name: row.name as string,
    description: (row.description ?? "") as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}
