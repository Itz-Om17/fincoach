import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: boolean;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 shadow-card transition-shadow hover:shadow-card-hover ${
        gradient ? "gradient-primary text-primary-foreground" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${gradient ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={`mt-1 text-xs font-medium ${
                changeType === "positive"
                  ? gradient ? "text-primary-foreground/80" : "text-success"
                  : changeType === "negative"
                  ? gradient ? "text-primary-foreground/80" : "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            gradient ? "bg-primary-foreground/20" : "bg-primary/10"
          }`}
        >
          <Icon className={`h-5 w-5 ${gradient ? "text-primary-foreground" : "text-primary"}`} />
        </div>
      </div>
    </motion.div>
  );
}
