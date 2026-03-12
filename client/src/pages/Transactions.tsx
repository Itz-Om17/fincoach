import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, CreditCard, Smartphone, Banknote, Search, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { fetchTransactions, createTransaction, bulkCreateTransactions, fetchCategories } from "@/lib/api";

interface Transaction {
  _id?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  method: string;
}

const methodIcon: Record<string, any> = {
  "Credit Card": CreditCard,
  "UPI": Smartphone,
  "Bank Transfer": Banknote,
  "Cash": Banknote,
};

const categoryColors: Record<string, string> = {
  Food: "bg-chart-food/10 text-destructive",
  Travel: "bg-primary/10 text-primary",
  Bills: "bg-warning/10 text-warning",
  Shopping: "bg-accent/10 text-accent",
  Entertainment: "bg-secondary/10 text-secondary",
  Income: "bg-success/10 text-success",
};

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function Transactions() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    description: "",
    amount: "",
    category: "",
    method: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', filterType, filterCategory],
    queryFn: () => fetchTransactions(filterType, filterCategory)
  });

  const { data: dbCategories } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Transaction added successfully");
      setIsOpen(false);
      setFormData({
        type: "expense",
        description: "",
        amount: "",
        category: "",
        method: "",
        date: new Date().toISOString().split('T')[0]
      });
    },
    onError: () => {
      toast.error("Failed to add transaction");
    }
  });

  const bulkMutation = useMutation({
    mutationFn: bulkCreateTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Transactions imported successfully");
      setIsUploadOpen(false);
    },
    onError: () => {
      toast.error("Failed to import transactions");
    }
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const processImportedData = (data: any[]) => {
    // Case-insensitive column lookup helper
    const getCol = (row: any, ...keys: string[]) => {
      for (const key of keys) {
        // Try exact match first
        if (row[key] !== undefined) return row[key];
        // Then case-insensitive
        const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
        if (found) return row[found];
      }
      return undefined;
    };

    const parsedData = data.map((row: any) => {
      // Robust date parser: handles Excel serials, Date objects, DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
      const parseDate = (d: any): string => {
        if (!d) return new Date().toISOString().split('T')[0];

        // Handle JS Date objects (XLSX may return these)
        if (d instanceof Date) {
          return d.toISOString().split('T')[0];
        }

        // Handle Excel Date Serial Number
        if (typeof d === 'number') {
          const excelEpoch = new Date(1899, 11, 30);
          const dateObj = new Date(excelEpoch.getTime() + d * 86400000);
          return dateObj.toISOString().split('T')[0];
        }

        const strDate = String(d).trim();

        // DD-MM-YYYY or DD/MM/YYYY
        const dmyMatch = strDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (dmyMatch) {
          const [, dd, mm, yyyy] = dmyMatch;
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }

        // YYYY-MM-DD (already correct format)
        const ymdMatch = strDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (ymdMatch) {
          const [, yyyy, mm, dd] = ymdMatch;
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        }

        // Try native Date parsing as last resort
        const parsed = new Date(strDate);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }

        // Fallback to today
        return new Date().toISOString().split('T')[0];
      };

      const rawDate = getCol(row, 'Date', 'date', 'Transaction Date');
      const rawDesc = getCol(row, 'Description', 'description', 'Desc', 'Narration');
      const rawAmount = getCol(row, 'Amount (INR)', 'Amount', 'amount');
      const rawType = getCol(row, 'Type', 'type', 'Transaction Type');
      const rawCategory = getCol(row, 'Category', 'category');
      const rawMethod = getCol(row, 'Payment Method', 'Method', 'Payment_Method', 'method');

      return {
        description: rawDesc || "Imported Transaction",
        amount: Number(String(rawAmount || 0).replace(/[^0-9.-]+/g, "")),
        type: (String(rawType || "expense")).toLowerCase() as "income" | "expense",
        category: rawCategory || "Other",
        date: parseDate(rawDate),
        method: rawMethod || "Cash"
      };
    }).filter(t => t.amount !== 0);

    if (parsedData.length > 0) {
      bulkMutation.mutate(parsedData);
    } else {
      toast.error("No valid data found in file");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'dd-mm-yyyy' });
          processImportedData(data);
        } catch (error: any) {
          toast.error(`Error parsing Excel file: ${error.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Unsupported file format. Please upload CSV or Excel.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category || !formData.method) {
      toast.error("Please fill all fields");
      return;
    }
    mutation.mutate({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = transactions?.filter(
    (t: Transaction) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalIncome = filtered.reduce((acc, t) => t.type === "income" ? acc + t.amount : acc, 0);
  const totalExpenses = filtered.reduce((acc, t) => t.type === "expense" ? acc + t.amount : acc, 0);
  const netTotal = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your finances</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 gradient-primary text-primary-foreground border-0">
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v: "income" | "expense") => setFormData({...formData, type: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="e.g., Grocery shopping" 
                    className="rounded-xl" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="rounded-xl" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["Food", "Travel", "Bills", "Shopping", "Entertainment", "Income"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.method} onValueChange={(v) => setFormData({...formData, method: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {["UPI", "Credit Card", "Bank Transfer", "Cash"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="w-full rounded-xl gradient-primary text-primary-foreground border-0"
                >
                  {mutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5">
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Upload Transactions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 text-center">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 hover:border-primary/50 transition-colors">
                  <Input 
                    type="file" 
                    accept=".csv, .xlsx, .xls" 
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="csv-upload" 
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer space-y-2 block">
                    <CreditCard className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground italic">Target Columns: Date, Description, Category, Amount (INR), Payment Method, Type</p>
                  </label>
                </div>
                {bulkMutation.isPending && (
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing transactions...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9 rounded-xl border-muted-foreground/20 h-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[120px] rounded-xl h-10 border-muted-foreground/20">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl h-10 border-muted-foreground/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {dbCategories?.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-card p-4 rounded-2xl border border-muted-foreground/5 shadow-card-sm">
          <p className="text-xs text-muted-foreground mb-1">Filtered Income</p>
          <p className="text-lg font-bold text-success">+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-muted-foreground/5 shadow-card-sm">
          <p className="text-xs text-muted-foreground mb-1">Filtered Expenses</p>
          <p className="text-lg font-bold text-destructive">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-muted-foreground/5 shadow-card-sm">
          <p className="text-xs text-muted-foreground mb-1">Net Flow</p>
          <p className={`text-lg font-bold ${netTotal >= 0 ? "text-primary" : "text-destructive"}`}>
            {netTotal >= 0 ? "+" : ""}{formatCurrency(netTotal)}
          </p>
        </div>
      </motion.div>

      <div className="space-y-3">
        {filtered.map((t: Transaction, i: number) => {
          const Icon = methodIcon[t.method] || CreditCard;
          return (
            <motion.div
              key={t._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 bg-card rounded-2xl border border-muted-foreground/5 shadow-card-sm hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm">{t.description}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                    <Badge variant="secondary" className={`text-[10px] h-4 px-1.5 font-medium rounded-full ${categoryColors[t.category] || "bg-muted text-muted-foreground"}`}>
                      {t.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-display font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.method}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
