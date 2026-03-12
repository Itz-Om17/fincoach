import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { InsightCard } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const spendingByCategory = [
  { name: "Food", value: 8500, color: "hsl(0, 72%, 56%)" },
  { name: "Travel", value: 4200, color: "hsl(234, 85%, 60%)" },
  { name: "Bills", value: 6800, color: "hsl(38, 92%, 55%)" },
  { name: "Shopping", value: 3100, color: "hsl(270, 60%, 58%)" },
  { name: "Entertainment", value: 2400, color: "hsl(174, 60%, 46%)" },
];

const weeklySpending = [
  { day: "Mon", amount: 1200 },
  { day: "Tue", amount: 800 },
  { day: "Wed", amount: 1500 },
  { day: "Thu", amount: 600 },
  { day: "Fri", amount: 2200 },
  { day: "Sat", amount: 3100 },
  { day: "Sun", amount: 1800 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Ankit 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value="₹1,24,500" change="+2.4% from last month" changeType="positive" icon={Wallet} gradient />
        <StatCard title="Monthly Income" value="₹65,000" change="Salary credited" changeType="positive" icon={TrendingUp} />
        <StatCard title="Monthly Expenses" value="₹38,200" change="+8% vs last month" changeType="negative" icon={TrendingDown} />
        <StatCard title="Savings" value="₹26,800" change="+₹2,000 this month" changeType="positive" icon={PiggyBank} />
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
                  {spendingByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {spendingByCategory.map((cat) => (
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
