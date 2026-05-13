import { useTheme } from "@/hooks/useTheme";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();
  return <>{children}</>;
}
