import { Bell, Search, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUnreadNotificationsCount, fetchDashboardStats, fetchUserProfile } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const { data: unreadData } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: fetchUnreadNotificationsCount,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchDashboardStats(),
  });

  const { data: user } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const userInitials = user?.name ? getInitials(user.name) : '??';

  const unreadCount = unreadData?.count || 0;
  const healthScore = stats?.healthScore || 0;

  const getScoreConfig = (score: number) => {
    if (score >= 75) return { color: "bg-success", text: "text-success", bg: "bg-success/10" };
    if (score >= 50) return { color: "bg-warning", text: "text-warning", bg: "bg-warning/10" };
    return { color: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" };
  };

  const scoreConfig = getScoreConfig(healthScore);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Search transactions, insights...</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Health Score */}
        <div className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 ${scoreConfig.bg}`}>
          <div className={`h-2.5 w-2.5 rounded-full ${scoreConfig.color}`} />
          <span className={`text-sm font-medium ${scoreConfig.text}`}>Score: {healthScore}</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate("/notifications")}
          className="relative rounded-xl p-2 hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] gradient-primary text-primary-foreground border-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-display">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
