import { motion } from "framer-motion";
import { Bell, CreditCard, PiggyBank, AlertTriangle, Clock } from "lucide-react";

interface Notification {
  id: number;
  icon: typeof Bell;
  iconColor: string;
  iconBg: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  { id: 1, icon: CreditCard, iconColor: "text-destructive", iconBg: "bg-destructive/10", message: "Electricity bill of ₹1,800 due tomorrow", time: "2 hours ago", read: false },
  { id: 2, icon: PiggyBank, iconColor: "text-success", iconBg: "bg-success/10", message: "You saved ₹2,000 more than last month! 🎉", time: "5 hours ago", read: false },
  { id: 3, icon: AlertTriangle, iconColor: "text-warning", iconBg: "bg-warning/10", message: "Unusual spending of ₹4,500 on shopping today", time: "1 day ago", read: false },
  { id: 4, icon: Clock, iconColor: "text-primary", iconBg: "bg-primary/10", message: "Reminder: Set next month's savings goal", time: "1 day ago", read: true },
  { id: 5, icon: CreditCard, iconColor: "text-destructive", iconBg: "bg-destructive/10", message: "Credit card payment of ₹12,300 due in 3 days", time: "2 days ago", read: true },
  { id: 6, icon: PiggyBank, iconColor: "text-success", iconBg: "bg-success/10", message: "Emergency fund reached 62% of target", time: "3 days ago", read: true },
  { id: 7, icon: AlertTriangle, iconColor: "text-warning", iconBg: "bg-warning/10", message: "Food spending exceeded weekly average by 25%", time: "4 days ago", read: true },
];

export default function Notifications() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay on top of your finances</p>
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-start gap-3 rounded-2xl p-4 transition-colors ${
              n.read ? "bg-card shadow-card" : "bg-primary/5 border border-primary/10"
            }`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${n.iconBg}`}>
              <n.icon className={`h-4 w-4 ${n.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                {n.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
