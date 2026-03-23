"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  Rocket,
  Cpu,
  Lock,
  Boxes,
  MapPin,
  CreditCard,
  LineChart,
  Server
} from "lucide-react";

const techStack = [
  "Next.js 15",
  "PostgreSQL",
  "React 19",
  "Stripe",
  "Paystack",
  "Docker",
  "Kubernetes",
  "Redis"
];

const metrics = [
  { label: "Total Addressable Market", value: "$37B+", icon: BarChart3, color: "text-emerald-400" },
  { label: "Platform Uptime", value: "99.99%", icon: Server, color: "text-teal-400" },
  { label: "Transactions Processed", value: "KSh 2.4M+", icon: CreditCard, color: "text-cyan-400" },
  { label: "Active Listings", value: "5,000+", icon: Boxes, color: "text-indigo-400" },
];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Deep dark animated background */}
        <div className="absolute inset-0 z-0 bg-grid-white/[0.02] pointer-events-none" />
        <motion.div
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{ y, opacity }}
        >
          {/* Responsive background blobs - smaller on mobile */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-[500px] md:h-[500px] bg-teal-600/20 rounded-full blur-[100px] md:blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-3xl bg-cyan-900/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-2 font-medium backdrop-blur-md rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              The Infrastructure of African Commerce
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.1] max-w-5xl mx-auto drop-shadow-2xl">
              Workspace & Storage, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                Unified.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light px-4 sm:px-0">
              Storeffice combines the booking model of Airbnb with the scale of Amazon. Monetize idle office space, rent intelligent storage, and reach customers instantly.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-2xl justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] border border-emerald-500/50 rounded-full transition-all group flex-1 sm:flex-none">
                <Link href="/register" className="flex items-center gap-2 justify-center">
                  Start with Storeffice
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-slate-900/50 hover:bg-slate-800 border-slate-700 text-slate-300 backdrop-blur-md rounded-full flex-1 sm:flex-none">
                <Link href="#investors" className="justify-center">View Storeffice Metrics</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030712] to-transparent z-10" />
      </section>

      {/* Investor Metrics Section */}
      <section id="investors" className="py-20 relative z-20 border-y border-white/5 bg-slate-950/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center text-center sm:items-start sm:text-left p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className={`p-3 rounded-xl bg-white/[0.05] ${metric.color} mb-4`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <h4 className="text-3xl md:text-4xl font-bold text-white mb-2">{metric.value}</h4>
                <p className="text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem & Solution (Bento Grid) */}
      <section className="py-24 lg:py-32 relative">
        <div className="container mx-auto px-4 z-10 relative">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              The Engine of Modern Business
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              We solve the massive fragmentation in commercial real estate and e-commerce logistics with a single, elegant platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Main Feature */}
            <motion.div
              className="md:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl group p-8 lg:p-12"
              whileHover={{ scale: 0.99 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                    <Globe className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Dual-Sided Marketplace</h3>
                  <p className="text-slate-400 text-lg max-w-md">
                    Connect property owners with businesses. List idle spaces, rent intelligent storage, and manage inventory—all powered by real-time analytics.
                  </p>
                </div>
                <div className="mt-8 flex gap-4">
                  <div className="h-2 w-20 bg-emerald-500 rounded-full" />
                  <div className="h-2 w-10 bg-slate-700 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Side Feature 1 */}
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl group p-8"
              whileHover={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
                <p className="text-slate-400">
                  Bank-grade encryption, PCI-compliant payments via Paystack/Stripe, and automated fraud prevention.
                </p>
              </div>
            </motion.div>

            {/* Side Feature 2 */}
            <motion.div
              className="relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl group p-8"
              whileHover={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Insights</h3>
                <p className="text-slate-400">
                  Predictive pricing, occupancy forecasting, and automated smart matching for spaces.
                </p>
              </div>
            </motion.div>

            {/* Bottom Wide Feature */}
            <motion.div
              className="md:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl group p-8"
              whileHover={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Scalable Infrastructure</h3>
                  <p className="text-slate-400">
                    Built on Next.js 15, deployed on edge networks, backed by highly available PostgreSQL clusters. Ready for Pan-African scale.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  {["Next.js", "Docker", "Typescript", "Supabase"].map(tech => (
                    <div key={tech} className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-center text-sm font-medium text-slate-300">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Marquee */}
      <section className="py-10 border-y border-white/5 bg-black/50 overflow-hidden">
        <div className="flex w-max min-w-full animate-marquee">
          {[...techStack, ...techStack, ...techStack].map((tech, i) => (
            <div key={i} className="flex-1 flex justify-center text-2xl font-bold text-slate-700 mx-8">
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* Showcase / Capabilities */}
      <section className="py-24 lg:py-32 relative">
        <div className="container mx-auto px-4 z-10 relative max-w-6xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/10 px-3 py-1">
                <MapPin className="h-3 w-3 mr-1" /> Core Functions
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Everything you need to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">operate at scale.</span>
              </h2>

              <div className="space-y-6 pt-4">
                {[
                  { icon: Building2, title: "Asset Monetization", desc: "List and manage physical locations with granular control." },
                  { icon: Users, title: "User Management", desc: "Role-based access control for Merchants, Owners, and Customers." },
                  { icon: LineChart, title: "Financial Reporting", desc: "Real-time ledger, automated invoicing, and tax compliance." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup UI Panel */}
            <div className="flex-1 w-full relative perspective-1000">
              <motion.div
                className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_0_50px_-12px_rgba(45,212,191,0.2)] overflow-hidden backdrop-blur-2xl"
                initial={{ rotateY: 10, rotateX: 5 }}
                whileInView={{ rotateY: 0, rotateX: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <div className="h-10 border-b border-white/10 bg-black/40 flex items-center px-4 gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <div className="p-6 grid gap-4">
                  <div className="h-32 rounded-xl bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border border-teal-500/20 p-4 flex flex-col justify-end">
                    <div className="text-3xl font-bold text-white mb-1">KSh 12,450,000</div>
                    <div className="text-teal-400 text-sm font-medium">+14.5% vs last month</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="h-2 w-12 bg-slate-600 rounded mb-4" />
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <Rocket className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                    <div className="h-24 rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                      <div className="h-2 w-16 bg-slate-600 rounded mb-4" />
                      <div className="w-full flex items-end h-8 gap-1">
                        {[40, 70, 45, 90, 65].map((h, i) => (
                          <div key={i} className="flex-1 bg-cyan-500/40 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Glow behind mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-500/10 blur-[100px] -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[#030712]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />

        <div className="container relative z-10 text-center max-w-3xl mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6 tracking-tight">Invest in the future of <br /> African Infrastructure.</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join the movement. Whether you're a property owner, retailer, or investor, Storeffice is built for scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-emerald-900 hover:bg-slate-200 transition-all font-semibold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <Link href="/register">Create an Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-white hover:bg-slate-800 rounded-full">
              <Link href="mailto:invest@storeffice.com">Contact Investor Relations</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
