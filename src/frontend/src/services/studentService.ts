import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import { generateTempPassword } from "@/utils/password";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export async function getStudents(adminId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Student[];
}

export async function getStudent(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Student | null;
}

export async function getStudentByEmail(
  email: string,
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data as Student | null;
}

export async function getStudentByProfileId(
  profileId: string,
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as Student | null;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export async function createStudent(
  adminId: string,
  data: CreateStudentForm,
): Promise<Student & { generated_temp_password: string }> {
  const tempPass = generateTempPassword(data.full_name);

  const { data: row, error } = await supabase
    .from("students")
    .insert({
      ...data,
      admin_id: adminId,
      profile_id: null,
      temp_password: tempPass,
      must_change_password: true,
      is_active: true,
    } as TablesInsert<"students">)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!row) throw new Error("Student creation returned no data");

  return { ...(row as Student), generated_temp_password: tempPass };
}

export async function updateStudent(
  id: string,
  data: UpdateStudentForm,
): Promise<Student> {
  const { data: row, error } = await supabase
    .from("students")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    } as TablesUpdate<"students">)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Student update returned no data");
  return row as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Legacy alias kept for backward compat with existing pages
// ---------------------------------------------------------------------------
export const addStudent = createStudent;
export const getStudentById = getStudent;
export const getStudentByProfileId_legacy = getStudentByProfileId;
