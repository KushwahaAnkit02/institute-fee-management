import { supabase } from "@/lib/supabase";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";

export async function getStudents(adminId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Student[];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Student;
}

export async function getStudentByEmail(
  email: string,
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data as Student;
}

export async function addStudent(
  adminId: string,
  form: CreateStudentForm,
): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .insert({
      admin_id: adminId,
      name: form.name,
      email: form.email,
      class_: form.class_,
      course: form.course,
      monthly_fee: form.monthly_fee,
      joined_date: form.joined_date,
      fee_start_date: form.fee_start_date,
      is_active: true,
      profile_id: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(
  id: string,
  form: UpdateStudentForm,
): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update({
      ...form,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}
