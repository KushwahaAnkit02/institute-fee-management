import { supabase } from "@/lib/supabase";
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

    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (mounted) storeLogout();
        return;
      }
      if (
        (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") &&
        session.user
      ) {
        const authUser = await buildAuthUser(session.user.id);
        if (authUser && mounted) login(authUser);
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
