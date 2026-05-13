import { motion } from "motion/react";
import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({
  children,
  collapsed = false,
  className = "",
}: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col bg-card border-r border-border/50 shadow-soft overflow-hidden shrink-0 ${className}`}
    >
      {children}
    </motion.aside>
  );
}
