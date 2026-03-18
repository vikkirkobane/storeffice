"use client";

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
  X,
  Linkedin,
  Twitter,
  Github,
  Instagram
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Building2,
    title: "Premium Spaces",
    description: "Discover handpicked office spaces and storage units across Africa, all with high-speed internet and modern amenities.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Paystack-powered transactions with PCI compliance, fraud detection, and instant refunds. Your money is protected.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Reserve spaces in minutes with real-time availability, instant confirmation, and automated invoicing.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, occupancy, and inventory with beautiful, actionable charts and exportable reports.",
  },
  {
    icon: Users,
    title: "Community Trust",
    description: "Verified listings, genuine reviews, and a 4.9/5 average rating from thousands of users.",
  },
  {
    icon: Globe,
    title: "Pan-African Reach",
    description: "Operating across Kenya, Nigeria, South Africa, and expanding to 10+ countries by 2026.",
  },
];

const stats = [
  { value: "500+", label: "Premium Listings" },
  { value: "10k+", label: "Happy Users" },
  { value: "98%", label: "Uptime SLA" },
  { value: "4.9/5", label: "User Rating" },
  { value: "30%", label: "Avg. Cost Savings" },
];

const steps = [
  { step: "1", title: "Create Account", desc: "Sign up in seconds with email or social login.", icon: Clock },
  { step: "2", title: "Browse Listings", desc: "Explore spaces, storage, and products near you with real-time availability.", icon: Building2 },
  { step: "3", title: "Book & Pay", desc: "Reserve and pay securely via Paystack with instant confirmation.", icon: ShieldCheck },
  { step: "4", title: "Enjoy", desc: "Move in, receive products, or start using your space. It's that simple.", icon: Award },
];

const testimonials = [
  { name: "Sarah K.", role: "Startup Founder, Nairobi", text: "Storeffice made finding our first office effortless. The booking process was smooth and the space was exactly what we needed. Highly recommended!" },
  { name: "James M.", role: "Logistics Manager, Lagos", text: "We've cut our storage costs by 30% using Storeffice. The platform is intuitive, the support team is outstanding, and the analytics help us optimize." },
  { name: "Amina N.", role: "Freelancer, Cape Town", text: "The product marketplace is a game-changer. I can order all my office supplies in one click and track deliveries in real-time." },
  { name: "David O.", role: "CTO, Accra", text: "As a tech company, we need reliability. Storeffice's uptime is 99.8% and their API integration made booking seamless for our team." },
];

const trustBadges = [
  { icon: ShieldCheck, label: "PCI Compliant" },
  { icon: Zap, label: "Instant Booking" },
  { icon: Globe, label: "Pan-African" },
  { icon: BarChart3, label: "Real-time Analytics" },
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
              <Link href="/spaces" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Spaces</Link>
              <Link href="/storage" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Storage</Link>
              <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Products</Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
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
                <Link href="/spaces" className="text-sm font-medium text-muted-foreground hover:text-primary">Spaces</Link>
                <Link href="/storage" className="text-sm font-medium text-muted-foreground hover:text-primary">Storage</Link>
                <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary">Products</Link>
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary">About</Link>
                <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary">Contact</Link>
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
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-primary/30 text-primary">
                🚀 Trusted by 10,000+ businesses across Africa
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
                The unified platform for{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
                  modern workspaces
                </span>{" "}
                and inventory.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Storeffice helps businesses discover, book, and manage office spaces, storage, and product marketplaces — all in one seamless, secure platform. Paystack-powered, enterprise-ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all">
                  <Link href="/register" className="flex items-center gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/5">
                  <Link href="/spaces">Explore Spaces</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <badge.icon className="h-4 w-4 text-primary" />
                    <span>{badge.label}</span>
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
                    <p className="text-muted-foreground">All-in-one workspace & inventory management</p>
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

      {/* Stats Bar */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY INNOVATIVE TEAMS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-60">
            {['TechCorp', 'GreenStart', 'AfricaHub', 'NextGen', 'CloudSync', 'DataDrive'].map((brand) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
            Join thousands of businesses using Storeffice to manage spaces, inventory, and sales with ease. Start your free trial today.
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
          <p className="mt-6 text-sm opacity-80">No credit card required. 14-day free trial.</p>
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
                {[
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Github, label: 'GitHub' },
                  { icon: Instagram, label: 'Instagram' }
                ].map((social) => (
                  <a key={social.label} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <span className="sr-only">{social.label}</span>
                    <social.icon className="h-5 w-5" />
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
                <li><Link href="/api" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
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
