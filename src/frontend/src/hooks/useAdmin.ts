import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { AdminRecord } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";

export function useMyAdmin() {
  const user = useAuthStore((s) => s.user);
  const adminId = user?.admin_id;
  return useQuery<AdminRecord | null>({
    queryKey: ["admin", adminId],
    queryFn: async () => {
      if (!adminId) return null;
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("id", adminId)
        .single();
      if (error) return null;
      return data as AdminRecord;
    },
    enabled: !!adminId,
  });
}
