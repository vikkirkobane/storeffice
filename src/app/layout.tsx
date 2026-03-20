import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storeffice — Office Spaces, Storage & Marketplace",
  description: "Discover, book, and manage office spaces, storage, and products in one unified platform. Trusted by businesses across Africa and beyond.",
};

const navLinks = [
  { href: "/spaces", label: "Spaces" },
  { href: "/storage", label: "Storage" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { icon: "twitter", label: "Twitter", href: "#" },
  { icon: "linkedin", label: "LinkedIn", href: "#" },
  { icon: "github", label: "GitHub", href: "#" },
  { icon: "instagram", label: "Instagram", href: "#" },
];

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "twitter":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
      );
    case "linkedin":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      );
    case "github":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      );
    case "instagram":
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      );
    default:
      return null;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Header */}
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <div className="h-10 w-10 relative flex items-center justify-center">
                    <Image
                      src="/storeffice-logo.png"
                      alt="Storeffice Logo"
                      width={40}
                      height={40}
                      style={{ width: 40, height: 'auto' }}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="font-bold text-xl text-foreground">Storeffice</span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                  {navLinks.map((link) => (
                    <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                  <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign in</a>
                  <a href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Get Started</a>
                </div>

                {/* Mobile menu (details/summary - no JS) */}
                <div className="md:hidden">
                  <details>
                    <summary className="cursor-pointer p-2">☰</summary>
                    <nav className="flex flex-col gap-4 p-4 border-t border-border/40">
                      {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary">
                          {link.label}
                        </a>
                      ))}
                      <div className="flex flex-col gap-2 pt-2">
                        <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign in</a>
                        <a href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Get Started</a>
                      </div>
                    </nav>
                  </details>
                </div>
              </div>
            </div>
          </header>

          <main id="main-content">{children}</main>

          {/* Footer */}
          <footer className="bg-background border-t py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-foreground">Storeffice</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    Unified platform for office spaces, storage, and marketplace solutions. Powering businesses across Africa.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-foreground">Product</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="/spaces" className="hover:text-foreground transition-colors">Spaces</a></li>
                    <li><a href="/storage" className="hover:text-foreground transition-colors">Storage</a></li>
                    <li><a href="/products" className="hover:text-foreground transition-colors">Products</a></li>
                    <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                    <li><a href="/api" className="hover:text-foreground transition-colors">API</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-foreground">Company</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
                    <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
                    <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
                    <li><a href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                    <li><a href="/legal/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> support@storeffice.com
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> +1 (555) 123-4567
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Nairobi, Kenya
                    </li>
                  </ul>
                </div>
              </div>
              <hr className="my-8 border-border" />
              <div className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Storeffice. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}