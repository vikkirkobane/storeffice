import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };
  return { title: product.title };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Link href="/products" className="text-emerald-400 hover:text-emerald-300 transition-colors mb-8 inline-flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to products
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-96 object-cover rounded-lg" />
            ) : (
            <div className="w-full h-[500px] bg-card border border-border rounded-2xl flex items-center justify-center overflow-hidden">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">{product.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{product.category} {product.subcategory && `• ${product.subcategory}`}</p>
            <div className="text-4xl font-bold text-emerald-400 mb-8">${Number(product.price).toFixed(2)}</div>
            
            <div className="bg-card/50 border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Inventory Status</span>
                <Badge variant={(product.inventory ?? 0) > 0 ? "outline" : "destructive"}>
                  {(product.inventory ?? 0) > 0 ? `${product.inventory} in stock` : "Out of stock"}
                </Badge>
              </div>
              <p className="text-foreground/80 leading-relaxed">{product.description}</p>
            </div>
            
            <Button size="lg" className="w-full md:w-auto h-12 px-8 text-lg font-semibold bg-primary hover:bg-primary/90">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
