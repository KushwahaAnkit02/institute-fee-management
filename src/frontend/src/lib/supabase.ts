import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Re-export Database so existing code that imports it from here still works
export type { Database };

// ---------------------------------------------------------------------------
// Supabase client — keys are supplied via .env (always configured)
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
