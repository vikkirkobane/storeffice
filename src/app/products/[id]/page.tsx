import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/products" className="text-indigo-600 hover:underline mb-4 inline-block">← Back to products</Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-96 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-4">{product.category} {product.subcategory && `• ${product.subcategory}`}</p>
            <div className="text-2xl font-bold text-indigo-600 mb-4">${Number(product.price).toFixed(2)}</div>
            <p className="text-gray-700 mb-4">Inventory: {product.inventory}</p>
            <p className="text-gray-700 mb-6">{product.description}</p>
            <Button size="lg">Add to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
