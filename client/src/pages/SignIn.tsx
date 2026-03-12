import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/lib/api";
import { toast } from "sonner";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem("token", data.token);
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Left side - Decorative Panel */}
      <div className="hidden lg:flex w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Soft decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-lg text-white">
          <Link to="/" className="flex items-center gap-2 mb-16 hover:opacity-90 transition-opacity">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">FinCoach</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Welcome back to your <br />AI Financial Coach
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-12 max-w-md">
              Sign in to continue tracking your goals, monitoring your budgets, and receiving intelligent financial insights.
            </p>
            
            {/* Minimal mockup illustration */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="w-full flex justify-between items-center mb-6">
                <div className="w-1/3 h-3 bg-white/20 rounded-full" />
                <div className="w-12 h-12 bg-white/20 rounded-xl" />
              </div>
              <div className="w-full h-8 flex gap-3 mb-6">
                <div className="w-1/2 h-full bg-emerald-400/80 rounded-full" />
                <div className="w-1/4 h-full bg-purple-400/80 rounded-full" />
                <div className="w-1/4 h-full bg-amber-400/80 rounded-full" />
              </div>
              <div className="w-3/4 h-3 bg-white/20 rounded-full mb-3" />
              <div className="w-1/2 h-3 bg-white/20 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">FinCoach</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Sign In</h2>
            <p className="text-muted-foreground mt-2">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-md" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-12 gradient-primary text-primary-foreground font-semibold border-0 shadow-elevated hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
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
              Sign in with Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}