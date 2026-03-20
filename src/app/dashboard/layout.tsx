"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Building2, 
  Warehouse, 
  Package, 
  Calendar, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  userType: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch (err) {
        toast.error("Failed to load user session");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user.userType === "owner" || user.userType === "admin"
      ? [
          { name: "My Spaces", href: "/dashboard/spaces", icon: Building2 },
          { name: "Storage Spaces", href: "/dashboard/storage", icon: Warehouse },
        ]
      : []),
    ...(user.userType === "merchant"
      ? [
          { name: "Storage Rentals", href: "/dashboard/storage", icon: Warehouse },
          { name: "My Products", href: "/dashboard/products", icon: Package },
        ]
      : []),
    ...(user.userType === "customer"
      ? [
          { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
          { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
        ]
      : []),
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <header className="bg-card/30 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl tracking-tight">Storeffice</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-muted/50 p-1.5 pr-4 rounded-full border border-border">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.fullName?.[0] || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none">{user.fullName || "User"}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{user.userType}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:text-destructive transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 sticky top-28">
              <nav className="space-y-1.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group hover:bg-primary/10 hover:text-primary"
                  >
                    <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-border px-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Support</p>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
