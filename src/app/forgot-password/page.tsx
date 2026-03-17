export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <form className="mt-8 space-y-4" action="/api/auth/reset-password" method="post">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <Input id="email" name="email" type="email" autoComplete="email" required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email" />
          </div>
          <Button type="submit" className="w-full">Send reset instructions</Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Remember your password? <a href="/login" className="text-indigo-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
