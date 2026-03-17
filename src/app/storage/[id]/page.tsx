import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StorageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [space] = await db.select().from(schema.storageSpaces).where(eq(schema.storageSpaces.id, id)).limit(1);

  if (!space) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/storage" className="text-indigo-600 hover:underline mb-4 inline-block">← Back to storage spaces</Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {space.photos?.[0] ? (
              <img src={space.photos[0]} alt={space.title} className="w-full h-96 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{space.title}</h1>
            <p className="text-gray-600 mb-4">
              {space.address}, {space.city}, {space.state} {space.zipCode}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {space.features?.map((f: string) => (
                <span key={f} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{f}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><strong>Monthly:</strong> ${space.monthlyPrice}</div>
              {space.annualPrice && <div><strong>Annual:</strong> ${space.annualPrice}</div>}
              <div><strong>Type:</strong> {space.storageType}</div>
              {space.lengthFt && <div><strong>Size:</strong> {space.lengthFt}' x {space.widthFt}' x {space.heightFt || '?'}'</div>}
            </div>
            <p className="text-gray-700 mb-6">{space.description}</p>
            <Button size="lg">Rent This Space</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
