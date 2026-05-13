import { supabase } from "@/lib/supabase";
import type { AuthState, AuthUser } from "@/types/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: AuthUser) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
