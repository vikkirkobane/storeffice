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
    <nav className="w-64 bg-white shadow-lg min-h-screen p-4 space-y-2">
      {items.map((it) => {
        const active = path === it.href || (it.href !== "/admin" && path.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              active ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
