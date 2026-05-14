import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";
import type { TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";

export default function ChangePasswordPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  async function handleSuccess() {
    if (user?.id) {
      await supabase
        .from("profiles")
        .update({ must_change_password: false } as TablesUpdate<"profiles">)
        .eq("id", user.id);
    }
    await useAuthStore.getState().refreshUser();
    navigate({ to: "/student/dashboard", replace: true });
  }

  return (
    <ChangePasswordModal
      open={true}
      required={true}
      onClose={() => {
        // noop — modal is required, cannot be dismissed
      }}
      onSuccess={handleSuccess}
    />
  );
}
