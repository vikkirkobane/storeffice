import { notFound } from "next/navigation";
import { getStorageSpace } from "@/lib/actions/storage-spaces";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const space = await getStorageSpace(id);
  if (!space) return { title: "Space not found" };
  return { title: space.title };
}

export default async function StorageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const space = await getStorageSpace(id);

  if (!space) notFound();

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Link href="/storage" className="text-emerald-400 hover:text-emerald-300 transition-colors mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to storage spaces
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {space.photos?.[0] ? (
              <img src={space.photos[0]} alt={space.title} className="w-full h-96 object-cover rounded-lg" />
            ) : (
            <div className="w-full h-[500px] bg-card border border-border rounded-2xl flex items-center justify-center overflow-hidden">
                <span className="text-muted-foreground">No photos available</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">{space.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {space.address}, {space.city}, {space.state} {space.zipCode}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {space.features?.map((f: string) => (
                <Badge key={f} variant="secondary" className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border-none">
                  {f}
                </Badge>
              ))}
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly</span><span className="text-xl font-bold text-emerald-400">${space.monthlyPrice}</span></div>
                {space.annualPrice && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual</span><span className="text-xl font-bold text-emerald-400">${space.annualPrice}</span></div>}
                <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Storage Type</span><span className="text-xl font-bold text-foreground capitalize">{space.storageType}</span></div>
                {space.lengthFt && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Size</span><span className="text-xl font-bold text-foreground">{space.lengthFt}' x {space.widthFt}' x {space.heightFt || '?'}</span></div>}
              </div>
              <p className="text-foreground/80 leading-relaxed text-sm pt-6 border-t border-border">{space.description}</p>
            </div>
            <Button size="lg" className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90">Rent This Space</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
