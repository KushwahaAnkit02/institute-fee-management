// ---------------------------------------------------------------------------
// Database type definitions — exact Supabase schema
// This file is imported by supabase.ts to avoid the self-referencing generic
// issue where createClient<Database> cannot resolve Database in the same file.
// Update types are flat explicit optional types (not Partial<Insert>) to avoid
// circular reference → never type cascades.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin" | "student";
          name: string;
          email: string;
          avatar_url: string | null;
          phone: string | null;
          gender: string | null;
          dob: string | null;
          address: string | null;
          provider: "email" | "google";
          temp_password: boolean;
          must_change_password: boolean;
          is_active: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role: "admin" | "student";
          name: string;
          email: string;
          avatar_url?: string | null;
          phone?: string | null;
          gender?: string | null;
          dob?: string | null;
          address?: string | null;
          provider: "email" | "google";
          temp_password?: boolean;
          must_change_password?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "student";
          name?: string;
          email?: string;
          avatar_url?: string | null;
          phone?: string | null;
          gender?: string | null;
          dob?: string | null;
          address?: string | null;
          provider?: "email" | "google";
          temp_password?: boolean;
          must_change_password?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          profile_id: string;
          institute_name: string;
          institute_code: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          institute_name: string;
          institute_code: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          institute_name?: string;
          institute_code?: string;
          address?: string | null;
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          admin_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          admin_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string | null;
          admin_id: string;
          class_id: string | null;
          subject_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          gender: string | null;
          dob: string | null;
          address: string | null;
          enrollment_no: string | null;
          admission_date: string | null;
          monthly_fee: number | null;
          status: string;
          joined_date: string | null;
          fee_start_date: string | null;
          is_active: boolean;
          temp_password: string | null;
          must_change_password: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          admin_id: string;
          class_id?: string | null;
          subject_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          gender?: string | null;
          dob?: string | null;
          address?: string | null;
          enrollment_no?: string | null;
          admission_date?: string | null;
          monthly_fee?: number | null;
          status?: string;
          joined_date?: string | null;
          fee_start_date?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          admin_id?: string;
          class_id?: string | null;
          subject_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          gender?: string | null;
          dob?: string | null;
          address?: string | null;
          enrollment_no?: string | null;
          admission_date?: string | null;
          monthly_fee?: number | null;
          status?: string;
          joined_date?: string | null;
          fee_start_date?: string | null;
          is_active?: boolean;
          temp_password?: string | null;
          must_change_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_payments: {
        Row: {
          id: string;
          student_id: string;
          admin_id: string;
          month: string;
          amount_paid: number;
          payment_method: "cash" | "online" | "cheque" | "card";
          notes: string | null;
          payment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          admin_id: string;
          month: string;
          amount_paid: number;
          payment_method: "cash" | "online" | "cheque" | "card";
          notes?: string | null;
          payment_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          admin_id?: string;
          month?: string;
          amount_paid?: number;
          payment_method?: "cash" | "online" | "cheque" | "card";
          notes?: string | null;
          payment_date?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          admin_id: string;
          student_id: string | null;
          title: string;
          message: string;
          type: "alert" | "reminder" | "update" | "payment";
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          student_id?: string | null;
          title: string;
          message: string;
          type: "alert" | "reminder" | "update" | "payment";
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          student_id?: string | null;
          title?: string;
          message?: string;
          type?: "alert" | "reminder" | "update" | "payment";
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};

// ---------------------------------------------------------------------------
// Convenience row type helpers
// ---------------------------------------------------------------------------
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
