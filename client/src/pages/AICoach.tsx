import { motion } from "framer-motion";
import { Bot, ArrowRight, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
  title: string;
  description: string;
  savings: string;
  priority: "high" | "medium" | "low";
}

const recommendations: Recommendation[] = [
  {
    title: "Reduce Food Delivery Spending",
    description: "Reducing food delivery by ₹1,000 monthly can increase your yearly savings by ₹12,000.",
    savings: "₹12,000/year",
    priority: "high",
  },
  {
    title: "Switch to Annual Subscriptions",
    description: "Switching Netflix & Spotify to annual plans saves ~20% compared to monthly billing.",
    savings: "₹1,800/year",
    priority: "medium",
  },
  {
    title: "Set Up Auto-Transfer to Savings",
    description: "Automatically move ₹5,000 on salary day to your savings account for painless saving.",
    savings: "₹60,000/year",
    priority: "high",
  },
  {
    title: "Review Unused Subscriptions",
    description: "You have 2 subscriptions with no usage in the last 30 days. Consider cancelling.",
    savings: "₹1,200/year",
    priority: "low",
  },
  {
    title: "Consolidate Short Cab Rides",
    description: "Consider walking or using public transport for rides under 3 km to cut travel costs.",
    savings: "₹4,500/year",
    priority: "medium",
  },
];

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
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="gradient-primary rounded-2xl p-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 shrink-0">
          <Bot className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground tracking-tight">AI Financial Coach</h1>
          <p className="text-primary-foreground/70 text-sm mt-1 leading-relaxed">
            Based on your spending patterns, here are personalized recommendations to help you save more and spend smarter.
          </p>
        </div>
      </motion.div>

      {/* Budget Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">Suggested Monthly Budget</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { cat: "Food", budget: "₹7,000", current: "₹8,500" },
            { cat: "Travel", budget: "₹3,500", current: "₹4,200" },
            { cat: "Bills", budget: "₹6,800", current: "₹6,800" },
            { cat: "Shopping", budget: "₹2,500", current: "₹3,100" },
            { cat: "Fun", budget: "₹2,000", current: "₹2,400" },
          ].map((item) => (
            <div key={item.cat} className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">{item.cat}</p>
              <p className="font-display font-bold text-sm mt-1">{item.budget}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Now: {item.current}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-sm">Recommendations</h3>
        {recommendations.map((rec, i) => (
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
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="rounded-xl gap-1.5 gradient-primary text-primary-foreground border-0">
                <CheckCircle2 className="h-3.5 w-3.5" /> Apply Suggestion
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5">
                Set Budget Limit <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
