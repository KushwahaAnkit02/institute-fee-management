import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { type ReactNode, useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { initialize, refreshUser, logout } = useAuthStore();
  const hasSubscribed = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    // Initialize once on mount — restores session from Supabase
    initialize();

    // Guard against StrictMode double-subscription
    if (hasSubscribed.current) return;
    hasSubscribed.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshUser();
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
      hasSubscribed.current = false;
    };
  }, []);

  return <>{children}</>;
}
