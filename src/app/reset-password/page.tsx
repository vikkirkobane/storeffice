"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success("Password reset successfully!");
      setComplete(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Password reset complete</CardTitle>
          <CardDescription className="text-center text-slate-400 text-base">
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-300 mb-4">
            You can now sign in with your new password.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => router.push("/login")}
            className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (error && !token) {
    return (
      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Invalid reset link</CardTitle>
          <CardDescription className="text-center text-slate-400 text-base">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-300 mb-4">
            Please request a new password reset email.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => router.push("/forgot-password")}
            className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            Request new reset link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Reset password</CardTitle>
        <CardDescription className="text-center text-slate-400 text-base">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-slate-200 font-medium ml-1">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="confirmPassword" className="text-slate-200 font-medium ml-1">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]" 
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset password"}
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
  );
}

function ResetFormSkeleton() {
  return (
    <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Reset password</CardTitle>
        <CardDescription className="text-center text-slate-400 text-base">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2.5">
          <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-12 bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2.5">
          <div className="h-4 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-12 bg-slate-800 rounded animate-pulse"></div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-6 pt-2">
        <div className="h-12 bg-slate-800 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <Suspense fallback={<ResetFormSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
