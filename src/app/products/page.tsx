import { listProducts } from "@/lib/actions/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Package, ShoppingCart } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "relevance";

  const { products, pagination } = await listProducts({
    search,
    category,
    city,
    minPrice,
    maxPrice,
    sort,
    page: 1,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse products from various merchants. Filter by category, price, location, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Search className="h-5 w-5" /> Filters
              </h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
                  <Input id="search" name="search" placeholder="Product name..." defaultValue={search || ""} />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                  <Input id="category" name="category" placeholder="e.g., Electronics" defaultValue={category || ""} />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">Storage City</label>
                  <Input id="city" name="city" placeholder="e.g., Nairobi" defaultValue={city || ""} />
                </div>
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium mb-1">Min Price</label>
                  <Input id="minPrice" name="minPrice" type="number" defaultValue={minPrice || ""} />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">Max Price</label>
                  <Input id="maxPrice" name="maxPrice" type="number" defaultValue={maxPrice || ""} />
                </div>
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium mb-1">Sort By</label>
                  <Select name="sort" defaultValue={sort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </Select>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Apply Filters</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => { window.location.href = "/products"; }}>
                  Clear
                </Button>
              </form>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {products.length} of {pagination.total} products
            </div>
            
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
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
                        <div className="text-xl font-bold">${product.price.toFixed(2)}</div>
                        {product.inventory && product.inventory > 0 && (
                          <Badge variant="outline">{product.inventory} in stock</Badge>
                        )}
                      </div>
                      {product.rating && product.rating > 0 && (
                        <div className="mt-2 text-sm text-yellow-600">★ {product.rating.toFixed(1)} ({product.review_count} reviews)</div>
                      )}
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
            
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={`?${new URLSearchParams({
                      ...(search && { search }),
                      ...(category && { category }),
                      ...(city && { city }),
                      ...(minPrice && { minPrice: String(minPrice) }),
                      ...(maxPrice && { maxPrice: String(maxPrice) }),
                      ...(sort && { sort }),
                      ...(page > 1 && { page: String(page) }),
                    })}`}
                    className={`px-3 py-2 rounded-md ${page === pagination.page ? "bg-primary text-primary-foreground" : "bg-white hover:bg-gray-100"}`}
                  >
                    {page}
                  </a>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}