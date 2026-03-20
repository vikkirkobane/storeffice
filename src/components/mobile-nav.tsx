"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/spaces", label: "Spaces" },
  { href: "/storage", label: "Storage" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button - proper touch target */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        style={{ width: "44px", height: "44px" }}
        aria-label="Open mobile menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Full-screen overlay menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer - slides from right with safe area */}
          <div
            ref={menuRef}
            className={cn(
              "fixed inset-y-0 right-0 z-50 w-[80vw] max-w-sm bg-background shadow-2xl md:hidden",
              "flex flex-col justify-between transform transition-transform duration-300 ease-in-out",
              "safe-area-inset-right px-6 py-6",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Header with close */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="h-10 w-10 relative flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <span className="font-bold text-xl text-foreground">Storeffice</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                style={{ width: "44px", height: "44px" }}
                aria-label="Close mobile menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Nav links - spaced for touch */}
            <nav className="flex-1">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-4 py-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset transition-colors"
                      style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer CTA */}
            <div className="mt-auto pt-6 border-t border-border space-y-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-4 py-4 text-center text-base font-medium text-foreground hover:bg-accent transition-colors"
                style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg px-4 py-4 text-center text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
