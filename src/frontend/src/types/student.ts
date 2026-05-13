export interface Student {
  id: string;
  profile_id: string | null;
  admin_id: string;
  name: string;
  email: string;
  class_: string;
  course: string;
  monthly_fee: number;
  joined_date: string;
  fee_start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  section?: string;
  enrollmentNumber?: string;
  admissionDate?: string;
}

export interface CreateStudentForm {
  name: string;
  email: string;
  class_: string;
  course: string;
  monthly_fee: number;
  joined_date: string;
  fee_start_date: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  section?: string;
  enrollmentNumber?: string;
  admissionDate?: string;
}

export interface UpdateStudentForm extends Partial<CreateStudentForm> {
  is_active?: boolean;
}

export interface ClassRecord {
  id: string;
  adminId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface SectionRecord {
  id: string;
  classId: string;
  adminId: string;
  name: string;
  createdAt: string;
}

export interface CreateClassForm {
  name: string;
  description: string;
}

export interface CreateSectionForm {
  classId: string;
  name: string;
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

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const SECTION_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
  "Morning",
  "Evening",
  "General",
] as const;

export const STATUS_OPTIONS = ["Active", "Inactive"] as const;
