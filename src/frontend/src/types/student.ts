/** Matches Supabase students table schema exactly. */
export interface Student {
  id: string;
  profile_id: string | null;
  admin_id: string;
  class_id: string;
  subject_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  address: string | null;
  enrollment_no: string | null;
  admission_date: string | null;
  monthly_fee: number;
  status: string;
  joined_date: string;
  fee_start_date: string;
  is_active: boolean;
  /** Temp password stored plain-text until first login (then nulled). */
  temp_password: string | null;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentForm {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  enrollment_no: string;
  admission_date: string;
  monthly_fee: number;
  status: string;
  class_id: string;
  subject_id: string;
}

export type UpdateStudentForm = Partial<CreateStudentForm> & {
  is_active?: boolean;
  must_change_password?: boolean;
  temp_password?: string | null;
};

export interface ClassRecord {
  id: string;
  admin_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface SectionRecord {
  id: string;
  class_id: string;
  name: string;
  created_at: string;
}

export interface SubjectRecord {
  id: string;
  admin_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassForm {
  name: string;
  description: string;
}

export interface CreateSectionForm {
  class_id: string;
  name: string;
}

export interface CreateSubjectForm {
  name: string;
  description?: string;
}

export const COURSE_OPTIONS: string[] = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "BCA",
  "MCA",
  "B.Tech",
  "B.Sc",
  "B.Com",
  "BA",
  "Diploma",
  "ITI",
  "Other",
];

export const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const SECTION_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
  "Morning",
  "Evening",
  "General",
] as const;

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
