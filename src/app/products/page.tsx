import { listProducts } from "@/lib/actions/products";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  // Basic filter support (only search for now)
  const search = typeof params.search === "string" ? params.search : undefined;

  const { products, pagination } = await listProducts({
    search,
    page: 1,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Products Marketplace</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Curated workspace essentials and equipment from verified merchants.
          </p>
        </div>

        <main>
          {products.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">We couldn&apos;t find any products matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {product.inventory === 0 && (
                      <Badge variant="destructive" className="absolute top-2 right-2">Out of stock</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold">${Number(product.price).toFixed(2)}</div>
                      {product.inventory && product.inventory > 0 && (
                        <Badge variant="outline">{product.inventory} in stock</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/products/${product.id}`} className="w-full">
                      <Button className="w-full">
                        <ShoppingCart className="mr-2 h-4 w-4" /> View Product
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
