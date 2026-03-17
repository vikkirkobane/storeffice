export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We've sent you a verification link. Click it to activate your account.
        </p>
        <div className="mt-8">
          <a href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Return to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
