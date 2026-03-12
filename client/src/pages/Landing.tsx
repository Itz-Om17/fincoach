import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Target, Bot, Bell, ShieldAlert, Sparkles, TrendingUp, CheckCircle2, MonitorSmartphone, ArrowRight, LayoutDashboard, Database, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">FinCoach</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-xl gradient-primary border-0 shadow-elevated hover:opacity-90">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Meet your new AI Financial Assistant</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-slate-900 mb-6">
              Your AI Financial Coach for <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-primary">Smarter Spending</span> and <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Better Savings</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              FinCoach analyzes your spending patterns, tracks your budgets, and helps you manage finances intelligently with personalized, real-time AI insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl gradient-primary border-0 shadow-elevated hover:opacity-90 transition-all">
                <Link to="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-white hover:bg-muted/50 border-border text-foreground">
                <Link to="/signin">
                  Sign In to Account
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 bottom-0 top-1/2 pointer-events-none" />
            <div className="rounded-3xl border border-muted/50 bg-white/50 backdrop-blur-xl p-2 shadow-2xl relative overflow-hidden ring-1 ring-slate-900/5">
              <div className="rounded-2xl border bg-slate-50 overflow-hidden">
                {/* Mock Browser Top */}
                <div className="flex items-center gap-2 bg-slate-100 border-b p-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                </div>
                {/* Mock UI layout */}
                <div className="flex h-[400px]">
                  {/* Mock Sidebar */}
                  <div className="w-48 bg-white border-r p-4 hidden sm:block">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-6 h-6 rounded bg-primary/20" />
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 rounded bg-slate-100/50 flex items-center px-2 gap-2">
                           <div className="w-4 h-4 rounded-full bg-slate-200" />
                           <div className="h-2.5 w-16 bg-slate-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 p-6 bg-slate-50">
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 h-32 bg-white rounded-xl border shadow-sm p-4 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-[100px]" />
                         <div className="w-8 h-8 rounded-lg bg-primary/10 mb-3" />
                         <div className="h-3 w-1/3 bg-slate-200 rounded mb-2" />
                         <div className="h-6 w-1/2 bg-slate-300 rounded" />
                      </div>
                      <div className="flex-1 h-32 bg-white rounded-xl border shadow-sm p-4 hidden md:block relative overflow-hidden">
                         <div className="w-8 h-8 rounded-lg bg-emerald-100 mb-3" />
                         <div className="h-3 w-1/3 bg-slate-200 rounded mb-2" />
                         <div className="h-6 w-1/2 bg-slate-300 rounded" />
                      </div>
                      <div className="flex-1 h-32 bg-white rounded-xl border shadow-sm p-4 hidden lg:block relative overflow-hidden">
                         <div className="w-8 h-8 rounded-lg bg-purple-100 mb-3" />
                         <div className="h-3 w-1/3 bg-slate-200 rounded mb-2" />
                         <div className="h-6 w-1/2 bg-slate-300 rounded" />
                      </div>
                    </div>
                    {/* Mock Graph/List */}
                    <div className="flex gap-4">
                      <div className="flex-2 w-2/3 h-56 bg-white rounded-xl border shadow-sm p-4">
                        <div className="h-4 w-1/4 bg-slate-200 rounded mb-6" />
                        <div className="h-32 w-full bg-slate-100 rounded-lg flex items-end px-4 gap-2 pb-2">
                           {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                             <div key={i} className="w-full bg-primary/20 rounded-t" style={{ height: `${h}%` }} />
                           ))}
                        </div>
                      </div>
                      <div className="flex-1 w-1/3 h-56 bg-white rounded-xl border shadow-sm p-4 hidden sm:block">
                        <div className="h-4 w-1/2 bg-slate-200 rounded mb-4" />
                        <div className="space-y-3">
                           {[1, 2, 3, 4].map(i => (
                             <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-slate-200" />
                                 <div className="h-2 w-12 bg-slate-200 rounded" />
                               </div>
                               <div className="h-2 w-8 bg-slate-300 rounded" />
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Powerful tools for your finances</h2>
            <p className="text-muted-foreground text-lg">Everything you need to effortlessly manage your money and achieve your savings goals faster.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Smart Expense Tracking",
                desc: "Track income, expenses, and transactions in one beautiful, organized place.",
                icon: Database,
                color: "text-blue-500", bg: "bg-blue-50 border-blue-100"
              },
              {
                title: "Behavioral Spending Analysis",
                desc: "Understand exactly where your money goes through automated AI analysis.",
                icon: MonitorSmartphone,
                color: "text-purple-500", bg: "bg-purple-50 border-purple-100"
              },
              {
                title: "Personalized Recommendations",
                desc: "Receive smart, tailored suggestions to improve your daily financial habits.",
                icon: Sparkles,
                color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100"
              },
              {
                title: "Risk Detection Alerts",
                desc: "Get instant warnings when you're overspending or falling behind on savings.",
                icon: ShieldAlert,
                color: "text-red-500", bg: "bg-red-50 border-red-100"
              },
              {
                title: "Smart Reminders",
                desc: "Never miss a beat with timely reminders for bills, budgets, and saving goals.",
                icon: Bell,
                color: "text-amber-500", bg: "bg-amber-50 border-amber-100"
              },
              {
                title: "Goal Tracking",
                desc: "Visualize your pathway to your financial goals with intelligent progress tracking.",
                icon: Target,
                color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-100"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-card transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">How FinCoach works</h2>
            <p className="text-muted-foreground text-lg">A simple 3-step process to financial clarity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 z-0" />
            
            {[
              {
                step: "01",
                title: "Add your data",
                desc: "Easily input your income and tracking your expenses.",
                icon: PiggyBank
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "FinCoach AI secretly analyzes your unique financial behavior in real-time.",
                icon: Bot
              },
              {
                step: "03",
                title: "Get Insights",
                desc: "Receive actionable insights, risk alerts, and bespoke recommendations.",
                icon: TrendingUp
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center mb-6 relative">
                   <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                     {step.step}
                   </div>
                   <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-[250px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-14 shadow-2xl overflow-hidden relative">
             {/* Decorative circles */}
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] bg-primary/20 blur-[100px] rounded-full" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[100%] bg-emerald-500/10 blur-[100px] rounded-full" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
               <div className="w-full md:w-1/2 text-white">
                 <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-6">Why use FinCoach?</h2>
                 <ul className="space-y-5">
                   {[
                     "Take absolute control over your spending",
                     "Build stronger, automated saving habits",
                     "Track your financial goals seamlessly",
                     "Receive intelligent, data-driven AI insights"
                   ].map((benefit, i) => (
                     <li key={i} className="flex items-center gap-3 text-lg text-white/90">
                       <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                       {benefit}
                     </li>
                   ))}
                 </ul>
               </div>
               
               <div className="w-full md:w-1/2 flex justify-center">
                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl max-w-sm w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">AI Coach Insight</p>
                          <p className="text-xs text-white/50">Just now</p>
                        </div>
                      </div>
                      <p className="text-white/90 leading-relaxed text-sm">
                        "You've saved ₹12,000 this month! Reducing your dining expenses slightly will help you hit your Vacation goal 2 months earlier."
                      </p>
                   </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to transform your finances?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of users who are taking control of their money with FinCoach today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-2xl gradient-primary border-0 shadow-elevated hover:opacity-90 transition-all">
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl border-2 hover:bg-muted/50 transition-all">
              <Link to="/signup">Start Managing Your Finances</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Wallet className="h-3 w-3 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">FinCoach</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-medium">
            <Link to="#" className="hover:text-primary transition-colors">About</Link>
            <Link to="#" className="hover:text-primary transition-colors">Features</Link>
            <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Social Icons Placeholders */}
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors" />
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors" />
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors" />
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} FinCoach. All rights reserved.
        </div>
      </footer>
    </div>
  );
}