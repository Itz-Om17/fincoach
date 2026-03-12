import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/api";
import { toast } from "sonner";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    income: "",
    goal: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      // Exclude confirmPassword from the API payload
      const { confirmPassword, ...payload } = formData;
      const data = await signup(payload);
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      
      {/* Left side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">FinCoach</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-2">Start your journey to smarter financial decisions.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5 mt-6">
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Optional Onboarding Fields */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="income" className="text-muted-foreground text-xs font-semibold uppercase">Income Range (Optional)</Label>
                <select
                  id="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Select range...</option>
                  <option value="under_30k">Under ₹30,000</option>
                  <option value="30k_to_70k">₹30,000 - ₹70,000</option>
                  <option value="70k_to_150k">₹70,000 - ₹1,50,000</option>
                  <option value="over_150k">Over ₹1,50,000</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-muted-foreground text-xs font-semibold uppercase">Main Goal (Optional)</Label>
                <select
                  id="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Select goal...</option>
                  <option value="saving">Saving more money</option>
                  <option value="budgeting">Strict Budgeting</option>
                  <option value="investing">Start Investing</option>
                  <option value="debt">Paying off debt</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 rounded-xl h-12 gradient-primary text-primary-foreground font-semibold border-0 shadow-elevated hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full rounded-xl h-12 gap-2 bg-white hover:bg-muted/50 border-border text-foreground">
              <img src="https://ucarecdn.com/a9c1bd1c-1f74-42b7-bdc6-cb17277bbf43/googlelogo.svg" alt="Google" className="h-5 w-5" />
              Sign up with Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative Panel (reversed logically) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Soft decorative circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-lg text-white">
          <Link to="/" className="flex flex-row-reverse items-center gap-2 mb-16 hover:opacity-90 transition-opacity justify-end">
            <span className="font-display text-2xl font-bold tracking-tight">FinCoach</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/10">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-right"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Build a solid <br />financial foundation
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-12 ml-auto max-w-md">
              Join thousands of users improving their financial health, smashing their savings goals, and taking control of their money with AI insights.
            </p>
            
            {/* Minimal mockup illustration */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl ml-auto w-full max-w-sm text-left">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <div className="text-right">
                  <div className="w-20 h-3 bg-white/20 rounded-full ml-auto mb-2" />
                  <div className="w-12 h-3 bg-white/10 rounded-full ml-auto" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <div className="w-6 h-6 bg-emerald-400/30 rounded-full" />
                  <div className="w-24 h-2 bg-white/20 rounded-full" />
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <div className="w-6 h-6 bg-purple-400/30 rounded-full" />
                  <div className="w-16 h-2 bg-white/20 rounded-full" />
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                  <div className="w-6 h-6 bg-amber-400/30 rounded-full" />
                  <div className="w-20 h-2 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}