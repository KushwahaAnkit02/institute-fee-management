import { logout as supabaseLogout } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const store = useAuthStore();

  async function logout() {
    try {
      await supabaseLogout();
      store.logout();
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Logout failed.");
    }
  }

  return { user, isAuthenticated, isLoading, logout };
}
