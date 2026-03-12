import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRecommendations, generateRecommendations, fetchDashboardStats } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Bot, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
  title: string;
  description: string;
  savings: string;
  priority: "high" | "medium" | "low";
}

interface BudgetSuggestion {
  category: string;
  target: number;
  current: number;
}

interface Alert {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface DashStats {
  alerts: Alert[];
  raw: any;
}

const priorityStyles = {
  high: "border-destructive/20 bg-destructive/5",
  medium: "border-warning/20 bg-warning/5",
  low: "border-primary/10 bg-primary/5",
};

const priorityBadge = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning-foreground",
  low: "bg-primary/10 text-primary",
};

export default function AICoach() {
  const queryClient = useQueryClient();

  // The API now returns { recommendations: [], budgets: [] }
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations
  });

  // Fetch dashboard stats for math-based alerts
  const { data: dashboardData } = useQuery<DashStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const mutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      toast.success("AI Coach updated with fresh insights!");
    },
    onError: () => {
      toast.error("Failed to generate AI insights. Check your Groq API key.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recommendations: Recommendation[] = data?.recommendations || [];
  const budgets: BudgetSuggestion[] = data?.budgets || [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="gradient-primary rounded-2xl p-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 shrink-0">
          <Bot className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-foreground tracking-tight">AI Financial Coach</h1>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl gap-2"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              Refresh AI Advice
            </Button>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-1 leading-relaxed">
            Based on your spending patterns, here are personalized recommendations to help you save more and spend smarter.
          </p>
        </div>
      </motion.div>

      {/* Financial Health Alerts (Math-based) */}
      {dashboardData?.alerts?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Priority Alerts
          </h3>
          <div className="grid gap-3">
            {dashboardData.alerts.map((alert: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  alert.type === 'error' ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-warning/5 border-warning/20 text-warning-foreground'
                }`}
              >
                <div className="flex-1">
                  <p className="font-bold text-sm">{alert.title}</p>
                  <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Summary */}
      {budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-sm">Suggested Monthly Budget limits</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {budgets.map((item) => (
              <div key={item.category} className="rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <p className="font-display font-bold text-sm mt-1">₹{item.target.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Spent: ₹{item.current.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">Recommendations</h3>
        {recommendations.length > 0 ? (
          recommendations.map((rec: Recommendation, i: number) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`rounded-2xl border p-5 ${priorityStyles[rec.priority]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-display font-semibold text-sm">{rec.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                  <p className="text-sm font-display font-semibold text-success mt-2">Potential savings: {rec.savings}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center border rounded-2xl border-dashed">
            <p className="text-muted-foreground">No recommendations found. Click "Refresh AI Advice" to generate fresh insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}
