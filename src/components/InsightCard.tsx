import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface InsightCardProps {
  message: string;
  type?: "info" | "warning" | "success";
}

export function InsightCard({ message, type = "info" }: InsightCardProps) {
  const styles = {
    info: "bg-primary/5 border-primary/10 text-primary",
    warning: "bg-warning/10 border-warning/20 text-warning-foreground",
    success: "bg-success/10 border-success/20 text-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 rounded-xl border p-3.5 ${styles[type]}`}
    >
      <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">{message}</p>
    </motion.div>
  );
}
