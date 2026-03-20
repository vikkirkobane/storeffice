import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const [space] = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1);
  if (!space) return { title: "Space not found" };
  return { title: space.title };
}

export default async function SpaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [space] = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, id)).limit(1);

  if (!space) notFound();

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Link href="/spaces" className="text-emerald-400 hover:text-emerald-300 transition-colors mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to spaces
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
              {space.amenities?.map((amenity: string) => (
                <Badge key={amenity} variant="secondary" className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border-none">
                  {amenity}
                </Badge>
              ))}
            </div>
            <div className="bg-card/50 border border-border rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {space.hourlyPrice && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hourly</span><span className="text-xl font-bold text-emerald-400">${space.hourlyPrice}</span></div>}
                {space.dailyPrice && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Daily</span><span className="text-xl font-bold text-emerald-400">${space.dailyPrice}</span></div>}
                {space.weeklyPrice && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Weekly</span><span className="text-xl font-bold text-emerald-400">${space.weeklyPrice}</span></div>}
                {space.monthlyPrice && <div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly</span><span className="text-xl font-bold text-emerald-400">${space.monthlyPrice}</span></div>}
              </div>
              <div className="flex items-center justify-between mb-6 pt-6 border-t border-border">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold text-foreground">{space.capacity} people</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">{space.description}</p>
            </div>
            <Button asChild size="lg" className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90">
              <Link href={`/bookings/new?spaceId=${space.id}`}>Book This Space</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
