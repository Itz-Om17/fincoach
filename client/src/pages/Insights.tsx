import { motion } from "framer-motion";
import { InsightCard } from "@/components/InsightCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";

const trendData = [
  { month: "Oct", spending: 32000 },
  { month: "Nov", spending: 28000 },
  { month: "Dec", spending: 41000 },
  { month: "Jan", spending: 35000 },
  { month: "Feb", spending: 30000 },
  { month: "Mar", spending: 38200 },
];

const comparisonData = [
  { month: "Feb", food: 7000, travel: 3500, bills: 6500, shopping: 2800, entertainment: 2000 },
  { month: "Mar", food: 8500, travel: 4200, bills: 6800, shopping: 3100, entertainment: 2400 },
];

const categoryGrowth = [
  { category: "Food", growth: 21, color: "hsl(0, 72%, 56%)" },
  { category: "Travel", growth: 20, color: "hsl(234, 85%, 60%)" },
  { category: "Bills", growth: 5, color: "hsl(38, 92%, 55%)" },
  { category: "Shopping", growth: 11, color: "hsl(270, 60%, 58%)" },
  { category: "Entertainment", growth: 20, color: "hsl(174, 60%, 46%)" },
];

export default function Insights() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Behavioral Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Understand your spending patterns over time</p>
      </div>

      {/* Trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-card p-5">
        <h3 className="font-display font-semibold text-sm mb-4">Spending Trend (6 months)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Spending"]} />
            <Line type="monotone" dataKey="spending" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Comparison */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Feb vs Mar Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Legend />
              <Bar dataKey="food" fill="hsl(0, 72%, 56%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="travel" fill="hsl(234, 85%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bills" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shopping" fill="hsl(270, 60%, 58%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="entertainment" fill="hsl(174, 60%, 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Growth */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Category Growth (Month-over-Month)</h3>
          <div className="space-y-4">
            {categoryGrowth.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{cat.category}</span>
                  <span className="font-display font-medium">+{cat.growth}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(cat.growth * 3, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">AI Insights</h3>
        <InsightCard message="Your weekend spending is consistently higher than weekday spending by ~40%." type="warning" />
        <InsightCard message="Food delivery spending increased by 30% this month. Consider cooking more to save." type="warning" />
        <InsightCard message="Bill payments are consistent — great financial discipline! 👏" type="success" />
      </div>
    </div>
  );
}
