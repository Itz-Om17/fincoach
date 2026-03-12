import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target, Loader2, Bot } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDashboardStats, fetchDashboardCharts, fetchAIInsights, createGoal } from "@/lib/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    category: "Savings"
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: fetchDashboardCharts
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: fetchAIInsights,
    refetchInterval: 300000 // Refetch every 5 minutes
  });

  const goalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success("Saving goal set successfully!");
      setIsGoalOpen(false);
      setGoalForm({ name: "", targetAmount: "", deadline: "", category: "Savings" });
    },
    onError: () => {
      toast.error("Failed to set goal");
    }
  });

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.deadline) {
      toast.error("Please fill all fields");
      return;
    }
    goalMutation.mutate({
      ...goalForm,
      targetAmount: Number(goalForm.targetAmount),
      currentAmount: 0,
      status: 'active'
    });
  };

  if (statsLoading || chartsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { spendingByCategory, weeklySpending } = chartsData;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, Ankit 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 border-primary/20 text-primary" asChild>
          <a href="/coach">
            <Bot className="h-4 w-4" /> Go to Coach
          </a>
        </Button>
      </div>

      {/* Priority Alerts (Critical Math-based alerts) */}
      {statsData?.alerts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid gap-3">
            {statsData.alerts.map((alert: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
                  alert.type === 'error' ? 'bg-destructive/5 border-destructive/20 text-destructive' : 'bg-warning/5 border-warning/20 text-warning-foreground'
                }`}
              >
                <Target className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{alert.title}</p>
                  <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={statsData.totalBalance} change={statsData.changes.totalBalance} changeType="positive" icon={Wallet} gradient />
        <StatCard title="Today's Income" value={statsData.dailyIncome} change={statsData.changes.dailyIncome} changeType="positive" icon={TrendingUp} />
        <StatCard title="Monthly Expenses" value={statsData.monthlyExpenses} change={statsData.changes.monthlyExpenses} changeType="negative" icon={TrendingDown} />
        <StatCard title="Cumulative Monthly Income" value={statsData.monthlyIncome} change={statsData.changes.monthlyIncome} changeType="positive" icon={PiggyBank} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Spending by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                  {spendingByCategory.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {spendingByCategory.map((cat: any) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="font-display font-medium ml-auto">₹{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Weekly Spending</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySpending} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-card)" }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-sm">AI Financial Insights</h3>
            {insightsLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          {aiInsights && aiInsights.length > 0 ? (
            aiInsights.map((insight: any, i: number) => (
              <InsightCard key={i} title={insight.title} message={insight.message} type={insight.type} />
            ))
          ) : (
            <>
              <InsightCard message="You spent 20% more on food this week compared to last week." type="warning" />
              <InsightCard message="Your savings increased by ₹2,000 this month. Great job! 🎉" type="success" />
              <InsightCard message="You have 3 upcoming bill payments this week." type="info" />
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm">Quick Actions</h3>
          <Button className="w-full justify-start gap-2 rounded-xl h-11" variant="outline" asChild>
            <a href="/transactions">
              <Plus className="h-4 w-4 text-success" /> Add Income
            </a>
          </Button>
          <Button className="w-full justify-start gap-2 rounded-xl h-11" variant="outline" asChild>
            <a href="/transactions">
              <Plus className="h-4 w-4 text-destructive" /> Add Expense
            </a>
          </Button>
          
          <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full justify-start gap-2 rounded-xl h-11 gradient-primary text-primary-foreground border-0">
                <Target className="h-4 w-4" /> Set Saving Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Set Saving Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGoalSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input 
                    placeholder="e.g., Buy a new Laptop" 
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input 
                    type="date" 
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={goalForm.category} onValueChange={(v) => setGoalForm({...goalForm, category: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={goalMutation.isPending}
                  className="w-full rounded-xl gradient-primary text-primary-foreground border-0"
                >
                  {goalMutation.isPending ? "Setting Goal..." : "Set Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
