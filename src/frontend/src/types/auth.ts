export type Role = "admin" | "student";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  provider: "email" | "google";
  created_at: string;
  updated_at: string;
}

export interface AdminRecord {
  id: string;
  profile_id: string;
  institute_name: string;
  institute_code: string;
  address: string | null;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  // Admin-only
  institute_name?: string;
  institute_code?: string;
  admin_id?: string;
  // Student-only
  student_id?: string;
  linked_admin_id?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: Role;
  institute_name?: string;
  institute_code?: string;
  address?: string;
}

export type AuthProvider = "email" | "google";
