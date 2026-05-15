import { supabase } from "@/lib/supabase";
import type { AdminRecord, AuthState, Profile } from "@/types/auth";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

/**
 * Guard flag — prevents double-initialization when React StrictMode
 * (or fast-refresh) mounts the provider twice in development.
 */
let _initializing = false;

export const useAuthStore = create<AuthState>()((set, _get) => ({
  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------
  user: null,
  profile: null,
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  /**
   * Called once on app mount. Restores session from Supabase, fetches profile
   * and admin rows, then marks the store as initialized.
   * Guards against concurrent double-calls with _initializing ref.
   */
  initialize: async () => {
    if (_initializing) return;
    _initializing = true;

    set({ isLoading: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        set({
          user: null,
          profile: null,
          admin: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      const supaUser = session.user;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .maybeSingle();

      const profile = profileData as Profile | null;

      // Fetch admin row if role is admin
      let admin: AdminRecord | null = null;
      if (profile?.role === "admin") {
        const { data: adminData } = await supabase
          .from("admins")
          .select("*")
          .eq("profile_id", supaUser.id)
          .maybeSingle();
        admin = adminData as AdminRecord | null;
      }

      set({
        user: supaUser,
        profile,
        admin,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch {
      set({
        user: null,
        profile: null,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    } finally {
      _initializing = false;
    }
  },

  /**
   * Re-fetches session + profile + admin from DB without a full re-initialization.
   * Also updates the user object from the active session.
   * Use after login, profile updates, password change, etc.
   */
  refreshUser: async () => {
    // Always refresh from the active session so user is up to date
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      set({
        user: null,
        profile: null,
        admin: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      return;
    }

    const supaUser = session.user;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supaUser.id)
      .maybeSingle();

    const profile = profileData as Profile | null;

    let admin: AdminRecord | null = null;
    if (profile?.role === "admin") {
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("profile_id", supaUser.id)
        .maybeSingle();
      admin = adminData as AdminRecord | null;
    }

    set({
      user: supaUser,
      profile,
      admin,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  /** Signs out from Supabase and clears all auth state. */
  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      profile: null,
      admin: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (
    user: User | null,
    profile: Profile | null,
    admin: AdminRecord | null,
  ) => set({ user, profile, admin, isAuthenticated: !!user }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
}));
