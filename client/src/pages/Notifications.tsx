import { motion } from "framer-motion";
import { Bell, CreditCard, PiggyBank, AlertTriangle, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAIInsights, markNotificationsAsRead } from "@/lib/api";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const typeMap: Record<string, any> = {
  success: { icon: PiggyBank, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  destructive: { icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" },
  high: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Notifications() {
  const queryClient = useQueryClient();
  
  const { data: insights, isLoading } = useQuery<any[]>({
    queryKey: ['ai-insights'],
    queryFn: fetchAIInsights
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    }
  });

  useEffect(() => {
    markReadMutation.mutate();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-driven updates on your financial goals</p>
      </div>

      <div className="space-y-2">
        {insights?.map((n, i) => {
          const config = typeMap[n.type] || typeMap.info;
          return (
            <motion.div
              key={n._id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 rounded-2xl p-4 bg-card shadow-card border transition-all ${n.read ? 'border-muted-foreground/5' : 'border-primary/20 bg-primary/[0.02]'}`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${config.bg}`}>
                <config.icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-display font-semibold text-sm mb-0.5">{n.title || "Financial Alert"}</p>
                  {!n.read && <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/20 text-primary bg-primary/5 uppercase font-bold tracking-wider">New</Badge>}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2 w-2" /> {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                  </p>
                  {n.read && <CheckCircle2 className="h-3 w-3 text-success/40" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
