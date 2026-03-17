"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, ShieldCheck, Zap, BarChart3, Users, Globe, CheckCircle2, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Building2,
    title: "Premium Spaces",
    description: "Browse handpicked office spaces and storage units tailored to your needs.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Paystack-powered transactions with fraud protection and refunds.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Reserve spaces in minutes with real-time availability.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, and inventory with beautiful charts.",
  },
  {
    icon: Users,
    title: "Community Trust",
    description: "Verified listings and reviews from real users.",
  },
  {
    icon: Globe,
    title: "Pan-African Reach",
    description: "Operating across East Africa with expansion plans.",
  },
];

const stats = [
  { value: "500+", label: "Listings" },
  { value: "10k+", label: "Users" },
  { value: "98%", label: "Uptime" },
  { value: "4.9/5", label: "Rating" },
];

const steps = [
  { step: "1", title: "Create Account", desc: "Sign up in seconds with email or social login." },
  { step: "2", title: "Browse Listings", desc: "Explore spaces, storage, and products near you." },
  { step: "3", title: "Book & Pay", desc: "Reserve and pay securely via Paystack." },
  { step: "4", title: "Enjoy", desc: "Move in, receive products, or start using your space." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">New: Paystack Checkout</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                The modern way to{" "}
                <span className="text-primary">manage office spaces</span> and inventory.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Storeffice helps businesses discover, book, and operate office spaces, storage, and product marketplaces — all in one seamless platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/spaces">Explore Spaces</Link>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 text-sm text-muted-foreground">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="w-full h-80 lg:h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Storeffice Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run your business</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From booking office spaces to managing inventory, Storeffice provides the tools to grow without friction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Start using Storeffice in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your workspace?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of businesses using Storeffice to manage spaces, inventory, and sales with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary/10">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-4">Storeffice</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Unified platform for office spaces, storage, and marketplace solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/spaces" className="hover:text-foreground">Spaces</Link></li>
                <li><Link href="/storage" className="hover:text-foreground">Storage</Link></li>
                <li><Link href="/products" className="hover:text-foreground">Products</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@storeffice.com</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Storeffice. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
