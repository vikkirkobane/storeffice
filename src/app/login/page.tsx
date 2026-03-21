"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") || "/dashboard";
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Welcome back!");
      
      // Small delay for toast visibility
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Sign in</CardTitle>
          <CardDescription className="text-center text-slate-400 text-base">
            Access your Storeffice account
          </CardDescription>
          {registered && (
            <p className="text-sm text-emerald-400 text-center mt-2">
              Account created! Please verify your email before signing in.
            </p>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-slate-200 font-medium ml-1">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to Account"}
            </Button>
            <div className="text-center text-sm text-slate-400 pb-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors underline-offset-4 hover:underline">
                Create one now
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
