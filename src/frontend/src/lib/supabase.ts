import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Add them to src/frontend/.env",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ---------------------------------------------------------------------------
// Database type definitions matching the Supabase schema
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
          is_active: boolean;
          provider: "email" | "google";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["profiles"]["Row"],
              "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["admins"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["admins"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
      };
      students: {
        Row: {
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
        };
        Insert: Omit<
          Database["public"]["Tables"]["students"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["students"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["monthly_payments"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["monthly_payments"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["monthly_payments"]["Insert"]
        >;
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
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["notifications"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
      };
    };
  };
};
