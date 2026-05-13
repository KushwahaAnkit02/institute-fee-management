import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  dataOcid?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  dataOcid,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      data-ocid={dataOcid}
    >
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-5 shadow-soft">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="gradient-accent text-primary-foreground"
          data-ocid={`${dataOcid ?? "empty"}.action_button`}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
