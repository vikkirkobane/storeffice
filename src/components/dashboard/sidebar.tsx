"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/spaces", label: "Office Spaces", icon: "🏢" },
    { href: "/dashboard/storage", label: "Storage Spaces", icon: "📦" },
    { href: "/dashboard/products", label: "Products", icon: "🛍️" },
    { href: "/dashboard/bookings", label: "Bookings", icon: "📅" },
    { href: "/dashboard/rentals", label: "Storage Rentals", icon: "🗄️" },
    { href: "/dashboard/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <div className="py-6">
        <nav className="space-y-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
