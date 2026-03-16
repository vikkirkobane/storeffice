import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Star, Truck } from "lucide-react";
import Image from "next/image";
import AddToCartButton from "@/components/cart/add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product || !product.isActive) {
    notFound();
  }

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-4">
          <a href="/products" className="text-primary hover:underline">← Back to all products</a>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="relative h-96 w-full bg-white rounded-lg overflow-hidden">
                <Image src={images[0]} alt={product.title} fill className="object-contain" priority />
              </div>
            )}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative h-20 bg-white rounded overflow-hidden">
                    <Image src={img} alt={`${product.title} ${idx + 2}`} fill className="object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{product.category}</Badge>
                {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
                {product.inventory === 0 && <Badge variant="destructive">Out of stock</Badge>}
                {product.inventory && product.inventory > 0 && product.inventory <= 5 && (
                  <Badge variant="secondary">Only {product.inventory} left</Badge>
                )}
              </div>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({product.review_count} reviews)</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.sku && (
                <div>
                  <span className="text-muted-foreground">SKU</span>
                  <p>{product.sku}</p>
                </div>
              )}
              {product.inventory !== undefined && (
                <div>
                  <span className="text-muted-foreground">Availability</span>
                  <p>{product.inventory > 0 ? `In Stock (${product.inventory})` : "Out of stock"}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Add to Cart */}
            {product.inventory && product.inventory > 0 && (
              <div className="flex items-center gap-4">
                <AddToCartButton
                  productId={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.images?.[0]}
                />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Free shipping
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
