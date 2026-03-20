export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Check your email</h2>
          <p className="text-muted-foreground text-lg mb-8">
            We've sent you a verification link. Click it to activate your account and start using Storeffice.
          </p>
          <div className="space-y-4">
            <a 
              href="/login" 
              className="inline-flex items-center justify-center w-full h-12 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              Return to sign in
            </a>
            <p className="text-xs text-muted-foreground">
              Didn't receive code? <button className="text-emerald-400 hover:underline">Resend email</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
