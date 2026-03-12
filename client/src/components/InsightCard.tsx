import { Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface InsightProps {
  title?: string;
  message: string;
  type: "info" | "success" | "warning";
}

const iconMap = {
  info: Lightbulb,
  success: TrendingUp,
  warning: AlertCircle,
};

export const InsightCard = ({ title, message, type }: InsightProps) => {
  const Icon = iconMap[type] || Lightbulb;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4 p-4 bg-card rounded-2xl border border-muted-foreground/5 shadow-card-sm w-full"
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
        type === "success" ? "bg-success/10 text-success" : 
        type === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {title && <h4 className="font-display font-semibold text-sm mb-0.5">{title}</h4>}
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
};
