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
import { fetchTransactions, createTransaction, bulkCreateTransactions } from "@/lib/api";

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
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
    const parsedData = data.map((row: any) => {
      // Helper to parse date from DD-MM-YYYY or Excel serial to YYYY-MM-DD
      const parseDate = (d: any) => {
        if (!d) return new Date().toISOString().split('T')[0];
        
        // Handle Excel Date Serial Number
        if (typeof d === 'number') {
           const excelEpoch = new Date(1899, 11, 30);
           const dateObj = new Date(excelEpoch.getTime() + d * 86400000);
           return dateObj.toISOString().split('T')[0];
        }

        const strDate = String(d);
        const parts = strDate.split('-');
        if (parts.length === 3) {
          // Assuming DD-MM-YYYY format from the screenshot
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return strDate;
      };

      return {
        description: row.Description || "Imported Transaction",
        // Extract numbers only in case of formatting
        amount: Number(String(row["Amount (INR)"] || row.Amount || 0).replace(/[^0-9.-]+/g,"")),
        type: (row.Type || "expense").toLowerCase() as "income" | "expense",
        category: row.Category || "Other",
        date: parseDate(row.Date),
        method: row["Payment Method"] || row.Method || "Cash"
      };
    }).filter(t => t.amount !== 0); // Ignore pure empty rows

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
           const wb = XLSX.read(bstr, { type: 'binary' });
           const wsname = wb.SheetNames[0];
           const ws = wb.Sheets[wsname];
           const data = XLSX.utils.sheet_to_json(ws);
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

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9 rounded-xl border-muted-foreground/20" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
