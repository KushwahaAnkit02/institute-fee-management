import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  buildAuthUser,
  logout as supabaseLogout,
} from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { type ReactNode, createContext, useContext, useEffect } from "react";

interface AuthContextValue {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Short-circuit: if Supabase is not configured, mark loading done immediately
    if (!isSupabaseConfigured) {
      if (mounted) storeLogout();
      return () => {
        mounted = false;
      };
    }

    // 1. Restore existing session on mount
    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // Stale/invalid session — clear it
          await supabase.auth.signOut();
          if (mounted) storeLogout();
          return;
        }

        if (session?.user && mounted) {
          const authUser = await buildAuthUser(session.user.id);
          if (authUser && mounted) {
            login(authUser);
          } else if (mounted) {
            storeLogout();
          }
        } else if (mounted) {
          storeLogout();
        }
      } catch {
        if (mounted) storeLogout();
      }
    };

    initSession();

    // 2. Listen for auth state changes (token refresh, sign-in, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        storeLogout();
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        if (session.user) {
          const authUser = await buildAuthUser(session.user.id);
          if (authUser && mounted) login(authUser);
          else if (mounted) storeLogout();
        }
      }

      if (event === "PASSWORD_RECOVERY") {
        // Session is available; user can update password on the settings page
        if (session.user) {
          const authUser = await buildAuthUser(session.user.id);
          if (authUser && mounted) login(authUser);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, storeLogout]);

  const handleLogout = async () => {
    await supabaseLogout();
    storeLogout();
  };

  return (
    <AuthContext.Provider value={{ logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
