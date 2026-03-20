"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "customer" as "customer" | "owner" | "merchant",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      
      toast.success("Account created successfully!");
      toast.info("Please check your email to verify your account.");
      
      // Delay for toasts and redirect to login
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl relative z-10 overflow-hidden my-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
        <CardHeader className="space-y-2 pb-8">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white">Create account</CardTitle>
          <CardDescription className="text-center text-slate-400 text-base">
            Join the Storeffice marketplace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="fullName" className="text-slate-200 font-medium ml-1">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-slate-200 font-medium ml-1">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-slate-200 font-medium ml-1">Phone <span className="text-xs text-slate-500 font-normal ml-1">(optional)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-slate-200 font-medium ml-1">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all"
              />
              <p className="text-[10px] text-slate-500 ml-1">Minimum 8 characters with letters and numbers</p>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="userType" className="text-slate-200 font-medium ml-1">I am a...</Label>
              <Select
                value={formData.userType}
                onValueChange={(value) => handleChange("userType", value)}
                disabled={loading}
              >
                <SelectTrigger className="bg-[#0f172a] border-white/10 h-12 rounded-xl text-white focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-white/10 rounded-xl text-white">
                  <SelectItem value="customer">Customer (book spaces, buy products)</SelectItem>
                  <SelectItem value="owner">Space Owner (list office/storage spaces)</SelectItem>
                  <SelectItem value="merchant">Merchant (store & sell products)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pt-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Start your journey"}
            </Button>
            <div className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors underline-offset-4 hover:underline">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
