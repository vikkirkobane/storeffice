import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">Reset your password</h2>
        <form className="mt-8 space-y-4" action="/api/auth/reset-password" method="post">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
          </div>
          <Button type="submit" className="w-full">Send reset instructions</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password? <a href="/login" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
