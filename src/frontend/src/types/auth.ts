import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "student";

export type AuthProvider = "email" | "google";

// -------------------------------------------------------------------------
// Database row types
// -------------------------------------------------------------------------

export interface Profile {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  provider: AuthProvider;
  temp_password: boolean;
  must_change_password: boolean;
  is_active: boolean;
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

// -------------------------------------------------------------------------
// Composite auth user (Supabase user + derived profile rows)
// -------------------------------------------------------------------------

export interface AuthUser {
  /** Supabase Auth User */
  user: User;
  /** Application profile row */
  profile: Profile | null;
  /** Admin row — only present when profile.role === 'admin' */
  admin: AdminRecord | null;
}

// -------------------------------------------------------------------------
// Zustand auth store shape
// -------------------------------------------------------------------------

export interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  admin: AdminRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the initial session check has completed (even if no session). */
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (
    user: User | null,
    profile: Profile | null,
    admin: AdminRecord | null,
  ) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

// -------------------------------------------------------------------------
// Form credential types
// -------------------------------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
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
