"use client";

import Link from "next/link";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  fullName?: string;
  userType?: string;
}

export default function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-indigo-600">Storeffice</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.fullName || user.email} ({user.userType || "user"})
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign out
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-800 focus:outline-none"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 space-y-3">
            <div className="text-sm text-gray-700">
              {user.fullName || user.email}
              <br />
              <span className="text-gray-500">{user.userType}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="block w-full text-left text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
