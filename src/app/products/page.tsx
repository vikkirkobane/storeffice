import { listProducts } from "@/lib/actions/products";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse products from various merchants.
          </p>
        </div>

        <main>
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Check back later for new listings.</p>
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
