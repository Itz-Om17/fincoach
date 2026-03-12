import { useQuery } from "@tanstack/react-query";
import { fetchForecast } from "@/lib/api";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Brain, Loader2, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function Forecast() {
  const { data, isLoading } = useQuery({
    queryKey: ['forecast'],
    queryFn: fetchForecast
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isGrowth = data?.growthRate > 0;

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight">Financial Forecast</h1>
        <p className="text-muted-foreground">AI-powered projections for your next 30 days based on historical patterns.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-muted-foreground/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Current Monthly Burn</CardDescription>
            <CardTitle className="text-2xl font-display font-bold">₹{data?.currentMonthlyExpense.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              Last 30 days of spending
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-muted-foreground/10 overflow-hidden relative border-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-primary">
            <Sparkles className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-primary">Projected Next Month</CardDescription>
            <CardTitle className="text-2xl font-display font-bold">₹{data?.projectedNextMonth.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-1 text-xs font-bold ${isGrowth ? 'text-destructive' : 'text-success'}`}>
              {isGrowth ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(data?.growthRate)}% {isGrowth ? 'increase' : 'decrease'} expected
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-primary border-0 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Brain className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider text-primary-foreground/70">AI Outlook</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium leading-relaxed italic">"{data?.summary}"</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card className="bg-card/30 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
               Top Categories Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data?.categoryProjections.map((cat: any, i: number) => {
              const diff = cat.projected - cat.current;
              const isUp = diff > 0;
              return (
                <div key={cat.category} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-medium">{cat.category}</p>
                      <p className="text-[10px] text-muted-foreground">Projected: ₹{cat.projected.toLocaleString()}</p>
                    </div>
                    <div className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-destructive' : 'text-success'}`}>
                      {isUp ? '+' : ''}₹{diff.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={Math.min(100, (cat.current / cat.projected) * 100)} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Visual Trend - Mocked dates for visual */}
        <Card className="bg-card/30 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Spending Projection Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Last Month', value: data?.currentMonthlyExpense },
                  { name: 'This Month', value: data?.projectedNextMonth },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--muted-foreground) / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
