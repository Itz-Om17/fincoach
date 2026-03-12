import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, updateUserProfile } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", email: "" });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl" 
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl" 
            />
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="rounded-xl gradient-primary text-primary-foreground border-0"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">Notification Preferences</h3>
        </div>
        {[
          { label: "Bill Reminders", desc: "Get reminders before bill due dates", checked: true },
          { label: "Spending Alerts", desc: "Alert when exceeding category budgets", checked: true },
          { label: "Savings Updates", desc: "Weekly savings progress reports", checked: false },
          { label: "AI Recommendations", desc: "Personalized saving tips from AI Coach", checked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch defaultChecked={item.checked} />
          </div>
        ))}
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">Security</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Switch />
        </div>
        <Separator />
        <Button variant="outline" className="rounded-xl">Change Password</Button>
      </motion.div>
    </div>
  );
}
