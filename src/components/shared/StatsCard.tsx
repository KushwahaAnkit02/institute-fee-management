import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
  delay?: number;
  dataOcid?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "text-primary",
  delay = 0,
  dataOcid,
}: StatsCardProps) {
  const isPositiveTrend = (trend?.value ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl p-5 shadow-soft cursor-default"
      data-ocid={dataOcid}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-xl bg-primary/10 ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-foreground tracking-tight mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      )}
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            isPositiveTrend ? "text-emerald-500" : "text-destructive"
          }`}
        >
          {isPositiveTrend ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {isPositiveTrend ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </motion.div>
  );
}
