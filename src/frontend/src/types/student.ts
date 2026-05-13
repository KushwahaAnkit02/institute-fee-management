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
}

export interface CreateStudentForm {
  name: string;
  email: string;
  class_: string;
  course: string;
  monthly_fee: number;
  joined_date: string;
  fee_start_date: string;
}

export interface UpdateStudentForm extends Partial<CreateStudentForm> {
  is_active?: boolean;
}
