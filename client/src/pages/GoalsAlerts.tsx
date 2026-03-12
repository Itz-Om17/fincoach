import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target, AlertTriangle, ShieldAlert, ShieldCheck, Loader2, Plus, PiggyBank,
  TrendingUp, Sparkles, Clock, IndianRupee, Eye, ArrowRight,
  Utensils, Film, ShoppingBag, Wallet, Brain, Zap,
  ChevronRight, Lightbulb, Rocket, Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGoals, fetchAIInsights, createGoal, updateGoal, deleteGoal, fetchDashboardStats, fetchDashboardCharts, fetchBudgets, saveBudgets } from "@/lib/api";
import { toast } from "sonner";

/* ── Types ────────────────────────────────────────────────────────── */

interface Goal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: string;
}

/* ── Static data for budget monitoring & risk alerts ──────────────── */

interface BudgetCategory {
  name: string;
  icon: typeof Utensils;
  limit: number;
  spent: number;
  color: string;
  editable?: boolean;
}

const budgetCategories: BudgetCategory[] = [
  { name: "Food & Dining", icon: Utensils, limit: 5000, spent: 0, color: "#ef4444" }, // Red-500
  { name: "Entertainment", icon: Film, limit: 3000, spent: 0, color: "#06b6d4" }, // Cyan-500
  { name: "Shopping", icon: ShoppingBag, limit: 2500, spent: 0, color: "#a855f7" }, // Purple-500
  { name: "Transport", icon: Wallet, limit: 4000, spent: 0, color: "#6366f1" }, // Indigo-500
];

interface RiskAlert {
  id: string;
  title: string;
  message: string;
  action: string;
  severity: "critical" | "warning" | "positive";
  timestamp: string;
}

const riskAlerts: RiskAlert[] = [
  {
    id: "a1", title: "Overspending Alert", message: "You exceeded your food budget by ₹1,500 this month.",
    action: "Review food expenses and find alternatives", severity: "critical", timestamp: "2 hours ago"
  },
  {
    id: "a2", title: "Budget Limit Exceeded", message: "Shopping spending crossed the ₹2,500 limit you set.",
    action: "Pause non-essential purchases this week", severity: "critical", timestamp: "1 day ago"
  },
  {
    id: "a3", title: "Low Savings Rate", message: "Your savings rate dropped to 15% this month (target: 25%).",
    action: "Increase monthly SIP by ₹2,000", severity: "warning", timestamp: "3 days ago"
  },
  {
    id: "a4", title: "Entertainment Budget", message: "You're at 80% of your entertainment budget with 20 days left.",
    action: "Consider free weekend activities", severity: "warning", timestamp: "5 days ago"
  },
  {
    id: "a5", title: "Bills Paid on Time", message: "All utility bills are paid on time this month. Great discipline!",
    action: "Keep it up — your credit score benefits", severity: "positive", timestamp: "1 week ago"
  },
  {
    id: "a6", title: "Savings Milestone", message: "You've saved ₹62,000 towards your Emergency Fund — 62% done!",
    action: "Stay consistent to reach your goal by July", severity: "positive", timestamp: "1 week ago"
  },
];

const severityConfig = {
  critical: {
    border: "border-red-200", bg: "bg-gradient-to-r from-red-50 to-rose-50",
    icon: ShieldAlert, iconColor: "text-red-500", iconBg: "bg-red-100",
    badge: "bg-red-100 text-red-700", label: "Critical"
  },
  warning: {
    border: "border-amber-200", bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
    icon: AlertTriangle, iconColor: "text-amber-500", iconBg: "bg-amber-100",
    badge: "bg-amber-100 text-amber-700", label: "Warning"
  },
  positive: {
    border: "border-emerald-200", bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
    icon: ShieldCheck, iconColor: "text-emerald-500", iconBg: "bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-700", label: "Good"
  },
};

/* AI Insight severity → config mapping for backend-driven alerts */
const aiSeverityStyles: Record<string, any> = {
  high: severityConfig.critical,
  warning: severityConfig.warning,
  safe: severityConfig.positive,
  info: { ...severityConfig.positive, icon: Lightbulb, iconColor: "text-blue-500", iconBg: "bg-blue-100", badge: "bg-blue-100 text-blue-700", label: "Info", border: "border-blue-200", bg: "bg-gradient-to-r from-blue-50 to-indigo-50" },
  success: severityConfig.positive,
};

/* ── Goal visual presets (color & gradient by index) ──────────────── */

const goalPresets = [
  { color: "#10b981", gradient: "from-emerald-500 to-teal-400", icon: ShieldCheck }, // Emerald-500
  { color: "#6366f1", gradient: "from-indigo-500 to-purple-500", icon: Rocket }, // Indigo-500
  { color: "#a855f7", gradient: "from-purple-500 to-pink-500", icon: Zap }, // Purple-500
  { color: "#f59e0b", gradient: "from-amber-500 to-orange-400", icon: TrendingUp }, // Amber-500
  { color: "#06b6d4", gradient: "from-cyan-500 to-blue-500", icon: Target }, // Cyan-500
  { color: "#ec4899", gradient: "from-pink-500 to-rose-500", icon: PiggyBank }, // Pink-500
];

/* ── Helpers ──────────────────────────────────────────────────────── */

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function estimateMonths(remaining: number, monthlySaving: number) {
  if (monthlySaving <= 0) return "∞";
  return Math.ceil(remaining / monthlySaving);
}

function getMonthsSaving(goal: Goal) {
  // Estimate based on deadline
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const remaining = goal.targetAmount - goal.currentAmount;
  return Math.ceil(remaining / monthsLeft);
}

/* ── Sub-components ──────────────────────────────────────────────── */

function GoalCard({ goal, index, onContribute, onDelete }: { goal: Goal; index: number; onContribute: (goal: Goal) => void; onDelete: (goal: Goal) => void }) {
  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const preset = goalPresets[index % goalPresets.length];
  const Icon = preset.icon;
  const suggestedMonthly = getMonthsSaving(goal);

  // Months left to deadline
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 20 }}
      className="group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Gradient header strip */}
      <div className={`h-1.5 bg-gradient-to-r ${preset.gradient}`} />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: preset.color + "18" }}
            >
              <Icon className="h-5 w-5" style={{ color: preset.color }} />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">{goal.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Clock className="inline h-3 w-3 mr-1 -mt-px" />
                {monthsLeft} {monthsLeft === 1 ? "month" : "months"} left
              </p>
            </div>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: preset.color + "18", color: preset.color }}
          >
            {pct}%
          </span>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <p className="font-display text-2xl font-bold tracking-tight">
            {formatCurrency(goal.currentAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            of {formatCurrency(goal.targetAmount)} target
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 w-full rounded-full bg-muted/60 overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${preset.gradient}`}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span>Remaining: {formatCurrency(remaining)}</span>
          <span>Save: {formatCurrency(suggestedMonthly)}/mo</span>
        </div>

        {/* Expand details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-muted/30 rounded-xl text-xs space-y-1.5"
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{goal.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadline</span>
              <span className="font-medium">{new Date(goal.deadline).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{goal.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suggested Monthly</span>
              <span className="font-medium">{formatCurrency(suggestedMonthly)}</span>
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            className="flex-1 h-8 rounded-lg text-xs gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
            onClick={() => onContribute(goal)}
          >
            <Plus className="h-3 w-3" /> Contribute
          </Button>
          <Button
            variant="outline" size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="outline" size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            onClick={() => onDelete(goal)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function BudgetCard({ category, index }: { category: BudgetCategory; index: number }) {
  const pct = Math.round((category.spent / category.limit) * 100);
  const isOverBudget = pct >= 90;
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.06 }}
      className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: category.color + "18" }}
          >
            <Icon className="h-4 w-4" style={{ color: category.color }} />
          </div>
          <div>
            <p className="text-sm font-medium">{category.name}</p>
            <p className="text-xs text-muted-foreground">Monthly Budget</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOverBudget ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
          {pct}%
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="font-display text-lg font-bold">{formatCurrency(category.spent)}</span>
        <span className="text-xs text-muted-foreground">of {formatCurrency(category.limit)}</span>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ delay: 0.5 + index * 0.06, duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: pct >= 90
              ? "linear-gradient(90deg, #ef4444, #dc2626)" // Red 500 -> 600
              : pct >= 70
                ? "linear-gradient(90deg, #f59e0b, #d97706)" // Amber 500 -> 600
                : `linear-gradient(90deg, ${category.color}, ${category.color}cc)`
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {formatCurrency(category.limit - category.spent)} remaining
      </p>
    </motion.div>
  );
}

function AlertCard({ alert, index }: { alert: RiskAlert; index: number }) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.06 }}
      className={`rounded-2xl border p-4 ${config.border} ${config.bg} hover:shadow-sm transition-all duration-200`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-display font-semibold text-sm">{alert.title}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <ArrowRight className="h-3 w-3 text-primary shrink-0" />
            <p className="text-xs font-medium text-primary">{alert.action}</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-1">{alert.timestamp}</span>
      </div>
    </motion.div>
  );
}

/* ── Main Page Component ──────────────────────────────────────────── */

export default function GoalsAlerts() {
  const queryClient = useQueryClient();

  /* ── API Data ── */
  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery<any[]>({
    queryKey: ["ai-insights"],
    queryFn: fetchAIInsights,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchDashboardStats()
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery<any>({
    queryKey: ['dashboard-charts'],
    queryFn: () => fetchDashboardCharts()
  });

  const { data: savedBudgets, isLoading: budgetsLoading } = useQuery<any[]>({
    queryKey: ['user-budgets'],
    queryFn: fetchBudgets
  });

  const saveBudgetsMutation = useMutation({
    mutationFn: saveBudgets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-budgets'] });
      toast.success('Budgets saved successfully!');
      setBudgetDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to save budgets');
    }
  });

  /* ── Mutations ── */
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
    queryClient.invalidateQueries({ queryKey: ["ai-insights"] });
  };

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      invalidateAll();
      setAddDialogOpen(false);
      setNewGoal({ name: "", target: "", deadline: "", category: "Savings" });
    },
  });

  const contributeMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: () => {
      invalidateAll();
      setContributeDialogOpen(false);
      setContributeAmount("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      invalidateAll();
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    },
  });

  /* ── Local State ── */
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "", category: "Savings" });
  const [budgets, setBudgets] = useState(
    budgetCategories.map(c => ({ name: c.name, limit: c.limit }))
  );

  // Sync budgets from DB when loaded
  useEffect(() => {
    if (savedBudgets && savedBudgets.length > 0) {
      // Map saved budgets to the local state format
      // Ensure we match by category name
      const syncedBudgets = budgetCategories.map(cat => {
        const saved = savedBudgets.find(b => b.category === cat.name);
        return { name: cat.name, limit: saved ? saved.limit : cat.limit };
      });
      setBudgets(syncedBudgets);
    }
  }, [savedBudgets]);

  /* ── Handlers ── */
  function handleCreateGoal() {
    if (!newGoal.name || !newGoal.target) return;
    createMutation.mutate({
      name: newGoal.name,
      targetAmount: Number(newGoal.target),
      currentAmount: 0,
      deadline: newGoal.deadline || "2027-01-01",
      category: newGoal.category,
      status: "active",
    });
  }

  function handleContribute() {
    if (!selectedGoal || !contributeAmount) return;
    const newAmount = selectedGoal.currentAmount + Number(contributeAmount);
    contributeMutation.mutate({
      id: selectedGoal._id,
      data: {
        currentAmount: Math.min(newAmount, selectedGoal.targetAmount),
        status: newAmount >= selectedGoal.targetAmount ? "completed" : "active",
      },
    });
  }

  function openContributeDialog(goal: Goal) {
    setSelectedGoal(goal);
    setContributeAmount("");
    setContributeDialogOpen(true);
  }

  function openDeleteDialog(goal: Goal) {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  }

  function handleDeleteGoal() {
    if (!goalToDelete) return;
    deleteMutation.mutate(goalToDelete._id);
  }

  /* ── Loading ── */
  if (goalsLoading || insightsLoading || statsLoading || chartsLoading || budgetsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── Derived Stats ── */
  const safeGoals = goals || [];
  const totalSaved = safeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = safeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const dynamicBudgetCategories = budgets.map((b, i) => {
    const staticCat = budgetCategories[i];
    const chartData = chartsData?.spendingByCategory?.find((c: any) =>
      c.name.toLowerCase().includes(b.name.split(" ")[0].toLowerCase())
    );
    return { ...staticCat, limit: b.limit, spent: chartData ? chartData.value : 0 };
  });

  const dynamicRiskAlerts: RiskAlert[] = [];
  dynamicBudgetCategories.forEach((cat: any) => {
    if (!cat) return;
    const pct = cat.limit > 0 ? cat.spent / cat.limit : 0;
    if (pct >= 1) {
      dynamicRiskAlerts.push({
        id: `alert-crit-${cat.name}`,
        title: "Budget Exceeded",
        message: `You exceeded your ${cat.name} budget by ${formatCurrency(cat.spent - cat.limit)}.`,
        action: `Review your ${cat.name} expenses.`,
        severity: "critical",
        timestamp: "Just now"
      });
    } else if (pct > 0.8) {
       dynamicRiskAlerts.push({
        id: `alert-warn-${cat.name}`,
        title: "Approaching Limit",
        message: `You're at ${Math.round(pct * 100)}% of your ${cat.name} budget.`,
        action: `Consider pausing non-essential purchases.`,
        severity: "warning",
        timestamp: "Just now"
      });
    }
  });

  const actualSavingsRate = (statsData?.raw?.monthlyIncome || 0) - (statsData?.raw?.monthlyExpenses || 0);

  if (actualSavingsRate < 0) {
    dynamicRiskAlerts.push({
        id: `alert-warn-savings`,
        title: "Negative Savings",
        message: `Your monthly expenses exceed your income by ${formatCurrency(Math.abs(actualSavingsRate))}.`,
        action: `Review expenses to restore positive savings.`,
        severity: "warning",
        timestamp: "Just now"
    });
  } else if (actualSavingsRate > 0 && totalSaved < totalTarget) {
     dynamicRiskAlerts.push({
        id: `alert-pos-savings`,
        title: "Positive Savings",
        message: `You have ${formatCurrency(actualSavingsRate)} in monthly savings capacity based on this month!`,
        action: `Keep it up to reach your goals faster.`,
        severity: "positive",
        timestamp: "Just now"
    });
  }

  if (overallPct >= 80) {
     dynamicRiskAlerts.push({
        id: `alert-pos-goals`,
        title: "Goals Nearing Target",
        message: `You are overall ${overallPct}% towards your targets. Outstanding!`,
        action: `Maintain your excellent financial habits.`,
        severity: "positive",
        timestamp: "Just now"
    });
  }

  return (
    <div className="space-y-8 max-w-6xl pb-8">
      {/* ═══════════════════ Page Header ═══════════════════ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goals & Alerts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your financial goals and stay on top of risk alerts
        </p>
      </div>

      {/* ═══════════════════ Quick Action Buttons ═══════════════════ */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3">
        {/* Add New Goal */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl h-10 gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Create New Goal
              </DialogTitle>
              <DialogDescription>
                Set a financial goal and we'll help you plan to achieve it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input id="goal-name" placeholder="e.g. New Car, House Down Payment" value={newGoal.name} onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Amount (₹)</Label>
                <Input id="goal-target" type="number" placeholder="e.g. 50000" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input id="goal-deadline" type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <select
                  id="goal-category"
                  value={newGoal.category}
                  onChange={e => setNewGoal(p => ({ ...p, category: e.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Savings">Savings</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Investment">Investment</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button className="rounded-xl gradient-primary text-primary-foreground border-0" onClick={handleCreateGoal} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Savings Contribution */}
        <Button
          variant="outline"
          className="gap-2 rounded-xl h-10 hover:bg-success/5 hover:text-success hover:border-success/30 transition-colors"
          onClick={() => {
            if (safeGoals.length > 0) openContributeDialog(safeGoals[0]);
          }}
        >
          <PiggyBank className="h-4 w-4" /> Add Savings Contribution
        </Button>

        <Button
          variant="outline"
          className="gap-2 rounded-xl h-10 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
          onClick={() => setBudgetDialogOpen(true)}
        >
          <IndianRupee className="h-4 w-4" /> Adjust Monthly Budget
        </Button>
      </motion.div>

      {/* ═══════════════════ Delete Goal Confirmation Dialog ═══════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" /> Delete Goal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">"{goalToDelete?.name}"</span>?
            </DialogDescription>
          </DialogHeader>
          {goalToDelete && goalToDelete.currentAmount > 0 && (
            <div className="text-sm p-3 bg-success/5 border border-success/20 rounded-xl">
              <span className="font-semibold text-success">{formatCurrency(goalToDelete.currentAmount)}</span> saved towards this goal will be returned to your total balance.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90 border-0"
              onClick={handleDeleteGoal}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ Adjust Monthly Budget Dialog ═══════════════════ */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" /> Adjust Monthly Budgets
            </DialogTitle>
            <DialogDescription>
              Set spending limits for each category to stay on track.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dynamicBudgetCategories.map((cat, i) => {
              const CatIcon = cat?.icon;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  {CatIcon && (
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat?.color || "hsl(0 0% 50%)") + "18" }}
                    >
                      <CatIcon className="h-4 w-4" style={{ color: cat?.color }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{cat.name}</Label>
                    <Input
                      type="number"
                      value={cat.limit}
                      onChange={e => {
                        const updated = [...budgets];
                        updated[i] = { ...updated[i], limit: Number(e.target.value) };
                        setBudgets(updated);
                      }}
                      className="rounded-xl h-9 mt-1"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-5 whitespace-nowrap">
                    Spent: {formatCurrency(cat?.spent || 0)}
                  </span>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setBudgetDialogOpen(false)}>Cancel</Button>
            <Button
              className="rounded-xl gradient-primary text-primary-foreground border-0"
              disabled={saveBudgetsMutation.isPending}
              onClick={() => {
                const updatedBudgets = budgets.map(b => ({
                  category: b.name,
                  limit: b.limit
                }));
                saveBudgetsMutation.mutate(updatedBudgets);
              }}
            >
              {saveBudgetsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Budgets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ Contribute Dialog ═══════════════════ */}
      <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent className="sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-success" /> Add Contribution
            </DialogTitle>
            <DialogDescription>
              {selectedGoal ? `Add savings to "${selectedGoal.name}" (${formatCurrency(selectedGoal.currentAmount)} of ${formatCurrency(selectedGoal.targetAmount)})` : "Select a goal"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Contribution Amount (₹)</Label>
              <Input type="number" placeholder="e.g. 5000" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} className="rounded-xl" />
            </div>
            {selectedGoal && contributeAmount && (
              <div className="text-xs text-muted-foreground p-3 bg-success/5 border border-success/20 rounded-xl">
                New balance will be: <span className="font-semibold text-success">{formatCurrency(Math.min(selectedGoal.currentAmount + Number(contributeAmount), selectedGoal.targetAmount))}</span>
                {" "}({Math.min(100, Math.round(((selectedGoal.currentAmount + Number(contributeAmount)) / selectedGoal.targetAmount) * 100))}% of target)
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setContributeDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl gradient-success text-white border-0" onClick={handleContribute} disabled={contributeMutation.isPending}>
              {contributeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ Overall Progress Summary ═══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card rounded-2xl shadow-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated">
            <Target className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall Goal Progress</p>
            <p className="font-display text-2xl font-bold">
              {formatCurrency(totalSaved)}{" "}
              <span className="text-sm font-normal text-muted-foreground">of {formatCurrency(totalTarget)}</span>
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">{overallPct}% completed</span>
            <span className="text-xs font-medium text-primary">{safeGoals.length} active goals</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════ Section 1: Financial Goals ═══════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">Financial Goals</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {safeGoals.map((goal, i) => (
            <GoalCard key={goal._id} goal={goal} index={i} onContribute={openContributeDialog} onDelete={openDeleteDialog} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ Section 2: AI Goal Progress Insights ═══════════════════ */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-accent" />
          <h2 className="font-display font-semibold text-sm">AI Goal Insights</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium ml-1">Powered by AI</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(aiInsights || []).map((insight, i) => {
              const cfg = aiSeverityStyles[insight.type] || aiSeverityStyles.info;
              const InsightIcon = cfg.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-white/50 hover:bg-white/90 transition-colors"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                    <InsightIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    {insight.title && (
                      <p className="text-xs font-semibold mb-0.5">{insight.title}</p>
                    )}
                    <p className="text-sm text-foreground/80 leading-relaxed">{insight.message}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Fallback static insights if AI returns empty */}
            {(!aiInsights || aiInsights.length === 0) && [
              {
                icon: Lightbulb,
                text: "At your current savings rate, you will reach your Laptop goal in 7 months.",
                color: "text-amber-500", bg: "bg-amber-100"
              },
              {
                icon: Sparkles,
                text: "Reducing food delivery spending by ₹1,000/month can help you reach your Vacation goal 2 months faster.",
                color: "text-purple-500", bg: "bg-purple-100"
              },
            ].map((insight, i) => (
              <motion.div
                key={`fallback-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-white/50 hover:bg-white/90 transition-colors"
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${insight.bg}`}>
                  <insight.icon className={`h-4 w-4 ${insight.color}`} />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════ Section 4: Budget Monitoring ═══════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">Budget Monitoring</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicBudgetCategories.map((cat, i) => (
            cat && <BudgetCard key={cat.name} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ Section 3: Risk Alerts ═══════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <h2 className="font-display font-semibold text-sm">Risk Alerts</h2>
          </div>
          <div className="flex gap-2">
            {(["critical", "warning", "positive"] as const).map(sev => {
              const count = dynamicRiskAlerts.filter(a => a.severity === sev).length;
              if (count === 0) return null;
              const cfg = severityConfig[sev];
              return (
                <span key={sev} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {count} {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
        <div className="space-y-3">
          {dynamicRiskAlerts.length > 0 ? dynamicRiskAlerts.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          )) : (
            <div className="text-sm text-muted-foreground p-4 bg-muted/20 border rounded-2xl">
              No active risk alerts at the moment. You're doing great!
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ Section 5: Goal Achievement Predictions ═══════════════════ */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="font-display font-semibold text-sm">Goal Achievement Predictions</h2>
        </div>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-border">
            {safeGoals.map((goal, i) => {
              const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              const remaining = goal.targetAmount - goal.currentAmount;
              // using current savings rate logically distributed across goals to project
              const effectiveMonthlySaving = actualSavingsRate > 0 ? Math.round(actualSavingsRate / safeGoals.length) : 0;
              const currentRateAmount = Math.max(100, effectiveMonthlySaving);
              const currentMonthsStr = estimateMonths(remaining, currentRateAmount);
              const boostedMonthsStr = estimateMonths(remaining, currentRateAmount + 2000);
              const preset = goalPresets[i % goalPresets.length];
              const GoalIcon = preset.icon;

              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:w-44">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: preset.color + "18" }}
                    >
                      <GoalIcon className="h-4 w-4" style={{ color: preset.color }} />
                    </div>
                    <span className="font-medium text-sm">{goal.name}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="relative h-2 flex-1 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${preset.gradient}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: preset.color }}>{pct}%</span>
                  </div>
                  <div className="flex items-center gap-2 sm:w-72">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{currentMonthsStr} months</span> at current rate
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <div className="text-xs">
                      <span className="font-medium text-success">{boostedMonthsStr} months</span>
                      <span className="text-muted-foreground"> with +₹2K/mo</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
}