import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target, Loader2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchDashboardCharts } from "@/lib/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: fetchDashboardCharts
  });

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Ankit 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today.</p>
      </div>

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
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-sm">Quick Insights</h3>
          <InsightCard message="You spent 20% more on food this week compared to last week." type="warning" />
          <InsightCard message="Your savings increased by ₹2,000 this month. Great job! 🎉" type="success" />
          <InsightCard message="You have 3 upcoming bill payments this week." type="info" />
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-semibold text-sm">Quick Actions</h3>
          <Button className="w-full justify-start gap-2 rounded-xl h-11" variant="outline">
            <Plus className="h-4 w-4 text-success" /> Add Income
          </Button>
          <Button className="w-full justify-start gap-2 rounded-xl h-11" variant="outline">
            <Plus className="h-4 w-4 text-destructive" /> Add Expense
          </Button>
          <Button className="w-full justify-start gap-2 rounded-xl h-11 gradient-primary text-primary-foreground border-0">
            <Target className="h-4 w-4" /> Set Saving Goal
          </Button>
        </div>
      </div>
    </div>
  );
}
