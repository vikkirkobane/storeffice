"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Store, ShoppingCart, Star, BarChart3 } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Store },
  { href: "/admin/transactions", label: "Transactions", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav className="w-64 bg-card/50 backdrop-blur-md border-r border-border min-h-screen p-6 sticky top-0">
      <div className="mb-8 px-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Management</p>
      </div>
      <div className="space-y-1.5">
        {items.map((it) => {
          const active = path === it.href || (it.href !== "/admin" && path.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
