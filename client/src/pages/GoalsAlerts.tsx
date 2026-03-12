import { motion } from "framer-motion";
import { Target, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const goals = [
  { name: "Emergency Fund", target: 100000, current: 62000 },
  { name: "Vacation Savings", target: 30000, current: 18500 },
  { name: "New Laptop", target: 80000, current: 45000 },
];

interface Alert {
  title: string;
  message: string;
  severity: "high" | "warning" | "safe";
}

const alerts: Alert[] = [
  { title: "Overspending Alert", message: "You've exceeded your monthly food budget by ₹1,500.", severity: "high" },
  { title: "Low Savings Warning", message: "Your savings rate dropped to 15% this month (target: 25%).", severity: "warning" },
  { title: "Budget Limit Exceeded", message: "Shopping spending crossed the ₹2,500 limit you set.", severity: "high" },
  { title: "Bills on Track", message: "All utility bills are paid on time this month.", severity: "safe" },
  { title: "Entertainment Budget", message: "You're at 80% of your entertainment budget with 20 days left.", severity: "warning" },
];

const severityStyles = {
  high: { border: "border-destructive/30", bg: "bg-destructive/5", icon: ShieldAlert, iconColor: "text-destructive" },
  warning: { border: "border-warning/30", bg: "bg-warning/5", icon: AlertTriangle, iconColor: "text-warning" },
  safe: { border: "border-success/30", bg: "bg-success/5", icon: ShieldCheck, iconColor: "text-success" },
};

export default function GoalsAlerts() {
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
          {goals.map((goal, i) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <motion.div
                key={goal.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl shadow-card p-5"
              >
                <p className="text-sm font-medium">{goal.name}</p>
                <p className="font-display text-2xl font-bold mt-2">
                  ₹{goal.current.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of ₹{goal.target.toLocaleString()}
                </p>
                <Progress value={pct} className="mt-3 h-2" />
                <p className="text-xs text-muted-foreground mt-1.5">{pct}% completed</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">Risk Alerts</h3>
        {alerts.map((alert, i) => {
          const s = severityStyles[alert.severity];
          return (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${s.border} ${s.bg}`}
            >
              <s.icon className={`h-5 w-5 mt-0.5 shrink-0 ${s.iconColor}`} />
              <div>
                <p className="font-display font-semibold text-sm">{alert.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
