export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-8">About Storeffice</h1>
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            Storeffice is the next-generation dual-purpose marketplace connecting office space owners, storage providers, and merchants in a single, unified ecosystem.
            Based in Nairobi and serving businesses across Africa, we are redefining how physical assets are monetized and managed.
          </p>
          <h2 className="text-3xl font-semibold text-foreground mt-12 mb-6">Our Vision</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Founded in 2025, Storeffice emerged from a simple insight: thousands of square meters of space remain underutilized while millions of merchants struggle to find secure storage and sales channels. 
            We bridge this gap with high-performance infrastructure.
          </p>
          <h2 className="text-3xl font-semibold text-foreground mt-12 mb-6">Why Storeffice?</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
            <li className="bg-card/50 p-4 rounded-xl border border-border">
              <span className="text-emerald-400 font-bold block mb-1">Scale</span> Enable space owners to list and scale property portfolios effortlessly.
            </li>
            <li className="bg-card/50 p-4 rounded-xl border border-border">
              <span className="text-emerald-400 font-bold block mb-1">Growth</span> Provide merchants with secure storage and direct-to-consumer pipelines.
            </li>
            <li className="bg-card/50 p-4 rounded-xl border border-border">
              <span className="text-emerald-400 font-bold block mb-1">Efficiency</span> Deliver a seamless, unified booking and shopping experience for all.
            </li>
            <li className="bg-card/50 p-4 rounded-xl border border-border">
              <span className="text-emerald-400 font-bold block mb-1">Security</span> Enterprise-grade security for both physical assets and digital payments.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
