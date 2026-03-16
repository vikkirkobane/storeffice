"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Office Spaces", href: "/spaces" },
  { name: "Storage", href: "/storage" },
  { name: "Products", href: "/products" },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="w-full max-w-6xl">
        <nav className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl hidden sm:inline">Storeffice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t">
              <div className="flex flex-col px-4 py-4 gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t mt-2 pt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          <style jsx>{`
            /* Simple fallback for Button if not available */
            .Button {
              display: inline-flex;
              align-items: center;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              font-weight: 500;
              transition: background-color 0.2s;
              cursor: pointer;
              border: 1px solid transparent;
            }
            .Button[variant="ghost"] {
              background: transparent;
              color: inherit;
            }
            .Button[variant="outline"] {
              border: 1px solid #e2e8f0;
              background: white;
            }
            .Button:not([variant]) {
              background: #2563eb;
              color: white;
            }
          `}</style>
        </nav>
      </div>
    </header>
  );
}
