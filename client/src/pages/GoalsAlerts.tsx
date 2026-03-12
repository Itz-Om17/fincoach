import { motion } from "framer-motion";
import { Target, AlertTriangle, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchGoals, fetchAIInsights } from "@/lib/api";

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: string;
}

const severityStyles: Record<string, any> = {
  high: { border: "border-destructive/30", bg: "bg-destructive/5", icon: ShieldAlert, iconColor: "text-destructive" },
  warning: { border: "border-warning/30", bg: "bg-warning/5", icon: AlertTriangle, iconColor: "text-warning" },
  safe: { border: "border-success/30", bg: "bg-success/5", icon: ShieldCheck, iconColor: "text-success" },
  info: { border: "border-primary/30", bg: "bg-primary/5", icon: ShieldCheck, iconColor: "text-primary" },
  success: { border: "border-success/30", bg: "bg-success/5", icon: ShieldCheck, iconColor: "text-success" },
};

export default function GoalsAlerts() {
  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: fetchGoals
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery<any[]>({
    queryKey: ['ai-insights'],
    queryFn: fetchAIInsights
  });

  if (goalsLoading || insightsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goals & Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your savings goals and risk alerts</p>
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Saving Goals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {goals?.map((goal, i) => {
            const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl shadow-card p-5"
              >
                <p className="text-sm font-medium">{goal.name}</p>
                <p className="font-display text-2xl font-bold mt-2">
                  ₹{goal.currentAmount.toLocaleString()}
                </p>
                <div className="flex justify-between items-end mt-0.5">
                  <p className="text-xs text-muted-foreground">
                    of ₹{goal.targetAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-primary font-medium">{goal.deadline}</p>
                </div>
                <Progress value={pct} className="mt-3 h-2" />
                <p className="text-xs text-muted-foreground mt-1.5">{pct}% completed</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Alerts (AI Driven) */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">AI Risk Alerts & Insights</h3>
        {aiInsights?.map((alert, i) => {
          const s = severityStyles[alert.type] || severityStyles.info;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${s.border} ${s.bg}`}
            >
              <s.icon className={`h-5 w-5 mt-0.5 shrink-0 ${s.iconColor}`} />
              <div>
                <p className="font-display font-semibold text-sm">{alert.title || "Financial Insight"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
