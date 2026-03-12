import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard, Smartphone, Banknote, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  method: string;
}

const initialTransactions: Transaction[] = [
  { id: 1, description: "Salary", amount: 65000, type: "income", category: "Income", date: "2026-03-01", method: "Bank Transfer" },
  { id: 2, description: "Swiggy Order", amount: 450, type: "expense", category: "Food", date: "2026-03-10", method: "UPI" },
  { id: 3, description: "Electricity Bill", amount: 1800, type: "expense", category: "Bills", date: "2026-03-08", method: "Auto-Pay" },
  { id: 4, description: "Amazon Purchase", amount: 2300, type: "expense", category: "Shopping", date: "2026-03-07", method: "Credit Card" },
  { id: 5, description: "Uber Ride", amount: 380, type: "expense", category: "Travel", date: "2026-03-06", method: "UPI" },
  { id: 6, description: "Netflix", amount: 649, type: "expense", category: "Entertainment", date: "2026-03-05", method: "Credit Card" },
  { id: 7, description: "Freelance Project", amount: 15000, type: "income", category: "Income", date: "2026-03-04", method: "Bank Transfer" },
  { id: 8, description: "Groceries", amount: 2100, type: "expense", category: "Food", date: "2026-03-03", method: "UPI" },
];

const methodIcon: Record<string, typeof CreditCard> = {
  "Credit Card": CreditCard,
  "UPI": Smartphone,
  "Bank Transfer": Banknote,
  "Auto-Pay": CreditCard,
};

const categoryColors: Record<string, string> = {
  Food: "bg-chart-food/10 text-destructive",
  Travel: "bg-primary/10 text-primary",
  Bills: "bg-warning/10 text-warning",
  Shopping: "bg-accent/10 text-accent",
  Entertainment: "bg-secondary/10 text-secondary",
  Income: "bg-success/10 text-success",
};

export default function Transactions() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your finances</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 gradient-primary text-primary-foreground border-0">
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select defaultValue="expense">
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="e.g., Grocery shopping" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" placeholder="0" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Food", "Travel", "Bills", "Shopping", "Entertainment", "Income"].map((c) => (
                        <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {["UPI", "Credit Card", "Bank Transfer", "Cash"].map((m) => (
                        <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full rounded-xl gradient-primary text-primary-foreground border-0">
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Connect Bank Mock */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gradient-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-sm">Connect your bank account</p>
          <p className="text-muted-foreground text-xs mt-0.5">Auto-import transactions from your bank or wallet</p>
        </div>
        <Button variant="outline" className="rounded-xl text-sm">Connect Bank</Button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 rounded-xl"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left p-4 font-medium">Description</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Method</th>
                <th className="text-right p-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const MethodIcon = methodIcon[t.method] || CreditCard;
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">{t.description}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className={`rounded-lg text-xs ${categoryColors[t.category] || ""}`}>
                        {t.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{t.date}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MethodIcon className="h-3.5 w-3.5" />
                        <span>{t.method}</span>
                      </div>
                    </td>
                    <td className={`p-4 text-right font-display font-semibold ${t.type === "income" ? "text-success" : "text-foreground"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
