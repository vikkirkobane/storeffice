"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      setError("Failed to reset password");
      setLoading(false);
    } else {
      router.push("/login?reset=success");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Input name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="New password" />
          <Input name="confirm" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm new password" />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
