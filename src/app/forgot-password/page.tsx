"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      toast.success("Password reset email sent!");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

        <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Check your email</CardTitle>
            <CardDescription className="text-center text-slate-400 text-base">
              We&apos;ve sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-slate-300">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <p className="text-sm text-slate-400">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline disabled:opacity-50"
              >
                try again
              </button>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Forgot password?</CardTitle>
          <CardDescription className="text-center text-slate-400 text-base">
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <div className="text-center text-sm text-slate-400 pb-2">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
