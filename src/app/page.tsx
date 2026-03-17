"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  TrendingUp,
  Clock,
  Award,
  Menu,
  X
} from "lucide-react";
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
    description: "Paystack-powered transactions with fraud protection and instant refunds.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Reserve spaces in minutes with real-time availability and instant confirmation.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, and inventory with beautiful, actionable charts.",
  },
  {
    icon: Users,
    title: "Community Trust",
    description: "Verified listings and genuine reviews from real users.",
  },
  {
    icon: Globe,
    title: "Pan-African Reach",
    description: "Operating across East Africa with plans for continental expansion.",
  },
];

const stats = [
  { value: "500+", label: "Listings" },
  { value: "10k+", label: "Users" },
  { value: "98%", label: "Uptime" },
  { value: "4.9/5", label: "Rating" },
];

const steps = [
  { step: "1", title: "Create Account", desc: "Sign up in seconds with email or social login.", icon: Clock },
  { step: "2", title: "Browse Listings", desc: "Explore spaces, storage, and products near you.", icon: Building2 },
  { step: "3", title: "Book & Pay", desc: "Reserve and pay securely via Paystack.", icon: ShieldCheck },
  { step: "4", title: "Enjoy", desc: "Move in, receive products, or start using your space.", icon: Award },
];

const testimonials = [
  { name: "Sarah K.", role: "Startup Founder", text: "Storeffice made finding our first office effortless. The booking process was smooth and the space was exactly what we needed." },
  { name: "James M.", role: "Logistics Manager", text: "We've cut our storage costs by 30% using Storeffice. The platform is intuitive and the support team is outstanding." },
  { name: "Amina N.", role: "Freelancer", text: "The product marketplace is a game-changer. I can order all my office supplies in one click." },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Storeffice</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/spaces" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Spaces</Link>
              <Link href="/storage" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Storage</Link>
              <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">Sign in</Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40">
              <nav className="flex flex-col gap-4">
                <Link href="/spaces" className="text-sm font-medium text-muted-foreground hover:text-foreground">Spaces</Link>
                <Link href="/storage" className="text-sm font-medium text-muted-foreground hover:text-foreground">Storage</Link>
                <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">Products</Link>
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">About</Link>
                <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">Contact</Link>
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild variant="outline" size="sm">Sign in</Button>
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-primary/30 text-primary">
                🚀 Now accepting payments via Paystack
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
                The modern way to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                  manage office spaces
                </span>{" "}
                and inventory.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Storeffice helps businesses discover, book, and operate office spaces, storage, and product marketplaces — all in one seamless, secure platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                  <Link href="/register" className="flex items-center gap-2">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/5">
                  <Link href="/spaces">Explore Spaces</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 pt-4 border-t border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-3xl font-bold text-primary">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full h-96 lg:h-full rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-100/30 to-teal-100/30 border border-primary/20 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-xl font-semibold text-foreground">Storeffice Platform</p>
                    <p className="text-muted-foreground">All-in-one workspace management</p>
                  </div>
                </div>
                {/* Floating UI elements */}
                <div className="absolute top-8 right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Booking Confirmed</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Revenue +127%</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-8 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-4">TRUSTED BY INNOVATIVE TEAMS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['TechCorp', 'GreenStart', 'AfricaHub', 'NextGen', 'CloudSync'].map((brand) => (
              <span key={brand} className="text-lg font-bold text-foreground">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Everything you need to run your business</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From booking office spaces to managing inventory, Storeffice provides the tools to grow without friction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="group bg-card border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by teams worldwide</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <p className="text-foreground italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground">Start using Storeffice in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((item, idx) => (
              <div key={item.step} className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg shadow-primary/25">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ready to transform your workspace?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of businesses using Storeffice to manage spaces, inventory, and sales with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 shadow-xl">
              <Link href="/register" className="flex items-center gap-2">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-foreground">Storeffice</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Unified platform for office spaces, storage, and marketplace solutions. Powering businesses across Africa.
              </p>
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'github'].map((platform) => (
                  <a key={platform} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <span className="sr-only">{platform}</span>
                    <div className="h-6 w-6 rounded-full bg-muted" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/spaces" className="hover:text-foreground transition-colors">Spaces</Link></li>
                <li><Link href="/storage" className="hover:text-foreground transition-colors">Storage</Link></li>
                <li><Link href="/products" className="hover:text-foreground transition-colors">Products</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
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
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Storeffice. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
