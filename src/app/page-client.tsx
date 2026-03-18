"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Clock,
  Award,
  Star,
  TrendingUp,
  Sparkles,
  Target,
  Layers,
  Cpu,
  Database,
  Cloud,
  Lock,
  FileCheck,
  Rocket,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Building2,
    title: "Premium Spaces",
    description: "Discover handpicked office spaces and storage units across Africa, all with high-speed internet and modern amenities.",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Paystack-powered transactions with PCI compliance, fraud detection, and instant refunds. Your money is protected.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Reserve spaces in minutes with real-time availability, instant confirmation, and automated invoicing.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, occupancy, and inventory with beautiful, actionable charts and exportable reports.",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Users,
    title: "Community Trust",
    description: "Verified listings, genuine reviews, and a 4.9/5 average rating from thousands of users.",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: Globe,
    title: "Pan-African Reach",
    description: "Operating across Kenya, Nigeria, South Africa, and expanding to 10+ countries by 2026.",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
];

const stats = [
  { value: "500+", label: "Premium Listings" },
  { value: "10k+", label: "Happy Users" },
  { value: "98%", label: "Uptime SLA" },
  { value: "4.9/5", label: "User Rating" },
  { value: "30%", label: "Avg. Cost Savings" },
  { value: "24/7", label: "Support" },
  { value: "50+", label: "Cities" },
  { value: "A+", label: "Security Rating" },
];

const testimonials = [
  { 
    name: "Sarah K.", 
    role: "Startup Founder, Nairobi", 
    text: "Storeffice made finding our first office effortless. The booking process was smooth and the space was exactly what we needed. Highly recommended!",
    avatar: "SK",
    rating: 5
  },
  { 
    name: "James M.", 
    role: "Logistics Manager, Lagos", 
    text: "We've cut our storage costs by 30% using Storeffice. The platform is intuitive, the support team is outstanding, and the analytics help us optimize.",
    avatar: "JM",
    rating: 5
  },
  { 
    name: "Amina N.", 
    role: "Freelancer, Cape Town", 
    text: "The product marketplace is a game-changer. I can order all my office supplies in one click and track deliveries in real-time.",
    avatar: "AN",
    rating: 5
  },
  { 
    name: "David O.", 
    role: "CTO, Accra", 
    text: "As a tech company, we need reliability. Storeffice's uptime is 99.8% and their API integration made booking seamless for our team.",
    avatar: "DO",
    rating: 5
  },
  { 
    name: "Wanjiru M.", 
    role: "Operations Lead, Kampala", 
    text: "The analytics dashboard gives us insights we never had before. We've improved occupancy rates by 25% in just 3 months.",
    avatar: "WM",
    rating: 5
  },
  { 
    name: "Kofi A.", 
    role: "SME Owner, Accra", 
    text: "Finally a platform that understands African businesses. Local payment methods, great support, and real value.",
    avatar: "KA",
    rating: 5
  },
];

const techStack = [
  "Next.js",
  "TypeScript",
  "Supabase",
  "OpenAI",
  "Paystack",
  "Stripe",
  "Docker",
  "Kubernetes",
  "Terraform",
];

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Mesh Gradient & 3D Effect */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a0a0a] to-slate-900 text-white py-20 lg:py-32 before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2Zy4uLgo=')] before:opacity-40"
      >
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 blur-3xl -top-40 -right-40 animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/20 via-purple-500/15 to-fuchsia-500/20 blur-3xl -bottom-40 -left-40 animate-pulse"
            style={{ animationDuration: "10s" }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDuration: "12s" }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-10">
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400 px-4 py-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                The Future of Workspace Management
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                One platform.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Infinite possibilities.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                Storeffice unifies office spaces, storage, and marketplace solutions into one seamless, intelligent platform. Built for modern African businesses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group">
                  <Link href="/register" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm">
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-500">
                {["No credit card required", "14-day free trial", "Cancel anytime"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - 3D Dashboard Preview */}
            <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
              <div className="relative w-full h-[400px] lg:h-full rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 border border-white/10 shadow-2xl backdrop-blur-xl transform rotate-y-2 hover:rotate-y-0 transition-transform duration-700 ease-out"
                   style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute inset-0 p-6 flex flex-col gap-4">
                  {/* Mock Dashboard UI */}
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center px-3">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse mr-2" />
                      <span className="text-xs font-semibold text-emerald-400">Live</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-700/50 border border-slate-600" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    <div className="col-span-2 space-y-3">
                      <div className="h-24 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 p-3">
                        <div className="h-2 w-12 bg-emerald-500/50 rounded mb-2" />
                        <div className="h-12 w-full bg-slate-800/50 rounded flex items-end gap-1">
                          {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/80 to-emerald-500/40 rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-xl bg-slate-800/50 border border-white/5 p-3">
                          <div className="h-2 w-8 bg-blue-500/50 rounded mb-2" />
                          <div className="text-lg font-bold text-white">2,436</div>
                          <div className="text-xs text-slate-500">Bookings</div>
                        </div>
                        <div className="h-16 rounded-xl bg-slate-800/50 border border-white/5 p-3">
                          <div className="h-2 w-8 bg-teal-500/50 rounded mb-2" />
                          <div className="text-lg font-bold text-white">94%</div>
                          <div className="text-xs text-slate-500">Occupancy</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-16 rounded-xl bg-slate-800/50 border border-white/5 p-3">
                        <div className="h-2 w-10 bg-amber-500/50 rounded mb-2" />
                        <div className="text-lg font-bold text-white">₦2.4M</div>
                        <div className="text-xs text-slate-500">Revenue</div>
                      </div>
                      <div className="h-24 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 p-3">
                        <div className="h-2 w-12 bg-purple-500/50 rounded mb-2" />
                        <div className="flex items-center justify-center h-10">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Cpu className="h-5 w-5 text-emerald-400" />
                          </div>
                        </div>
                        <div className="text-xs text-center text-slate-500 mt-1">AI Insights</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 md:top-8 md:-right-8 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Revenue +127%</p>
                    <p className="text-xs text-slate-400">This month</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl animate-bounce-slow" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">2,000+ Active Users</p>
                    <p className="text-xs text-slate-400">Real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="py-12 bg-slate-950 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Trusted by innovative companies across Africa
          </p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...techStack, ...techStack].map((tech, i) => (
              <span key={i} className="mx-8 text-4xl font-bold text-slate-300 hover:text-slate-200 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.slice(0, 4).map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Bento Grid */}
      <section className="py-20 lg:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-3 py-1">
              <Layers className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                scale your business
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From booking office spaces to managing inventory, Storeffice provides the tools to grow without friction.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large feature cards */}
            <Card className="md:col-span-2 bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Premium Spaces</h3>
                <p className="text-slate-400 leading-relaxed">
                  Discover handpicked office spaces and storage units across Africa, all with high-speed internet, meeting rooms, and modern amenities. Each listing is verified for quality and compliance.
                </p>
                <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>

            <Card className="bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Secure Payments</h3>
                <p className="text-slate-400">Paystack-powered with PCI compliance, fraud detection, and instant refunds.</p>
              </div>
            </Card>

            <Card className="bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Instant Booking</h3>
                <p className="text-slate-400">Real-time availability, instant confirmation, automated invoicing.</p>
              </div>
            </Card>

            <Card className="bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Analytics Dashboard</h3>
                <p className="text-slate-400 leading-relaxed">
                  Track bookings, revenue, occupancy, and inventory with beautiful, actionable charts. Export reports, set alerts, and make data-driven decisions with AI-powered insights.
                </p>
                <div className="mt-6 flex items-center gap-2 text-cyan-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  View demo <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>

            <Card className="bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Community Trust</h3>
                <p className="text-slate-400">4.9/5 rating from verified users.</p>
              </div>
            </Card>

            <Card className="bg-transparent bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Pan-African Reach</h3>
                <p className="text-slate-400">Operating in 50+ cities, expanding to 10+ countries.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials with parallax */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2Zy4uLgo=')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 px-3 py-1 mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by teams
              <span className="text-emerald-400"> worldwide</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="bg-transparent bg-slate-800/50 border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 group">
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 italic leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-sm text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Mesh Gradient */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 -mr-40 -mt-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to transform your
            <br />
            <span className="text-emerald-200">workspace?</span>
          </h2>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Join thousands of businesses using Storeffice to manage spaces, inventory, and sales with ease. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 shadow-2xl hover:shadow-white/20 transition-all duration-300 group">
              <Link href="/register" className="flex items-center gap-2">
                Create Free Account
                <Rocket className="h-4 w-4 group-hover:animate-bounce" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
          <p className="mt-6 text-emerald-200 text-sm">No credit card required. 14-day free trial. Cancel anytime.</p>
        </div>
      </section>
    </div>
  );
}
