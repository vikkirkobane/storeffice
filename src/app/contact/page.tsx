"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // TODO: implement email sending via Resend
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -left-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-8 text-center">Contact Us</h1>
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
          {sent ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
              <p className="text-muted-foreground text-lg">Your message has been received. Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <Input id="name" name="name" required placeholder="Your full name" className="bg-background/50 border-border focus:ring-emerald-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input id="email" name="email" type="email" required placeholder="name@company.com" className="bg-background/50 border-border focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                <Textarea id="message" name="message" rows={5} required placeholder="How can we help you?" className="bg-background/50 border-border focus:ring-emerald-500" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Other ways to reach us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-foreground">support@storeffice.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Location</p>
                  <p className="font-medium text-foreground">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
