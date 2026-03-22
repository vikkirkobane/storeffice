import { listStorageSpaces } from "@/lib/actions/storage-spaces";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Warehouse, MapPin, Ruler, DollarSign } from "lucide-react";

interface StoragePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoragePage({ searchParams }: StoragePageProps) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : undefined;
  const storageType = typeof params.storageType === "string" ? params.storageType as "shelf" | "room" | "warehouse" : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  
  const { storageSpaces: spaces, pagination } = await listStorageSpaces({
    city,
    storageType,
    minPrice,
    maxPrice,
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Storage Spaces</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Find secure, scalable storage solutions for your inventory or personal assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4 text-foreground">Filters</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <Input id="city" name="city" placeholder="e.g., Nairobi" defaultValue={city || ""} />
                </div>
                <div>
                  <label htmlFor="storageType" className="block text-sm font-medium mb-1">Type</label>
                  <select
                    id="storageType"
                    name="storageType"
                    defaultValue={storageType || ""}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="shelf">Shelf</option>
                    <option value="room">Room</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium mb-1">
                    Min Monthly Price
                  </label>
                  <Input id="minPrice" name="minPrice" type="number" defaultValue={minPrice || ""} />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">Max Monthly Price</label>
                  <Input id="maxPrice" name="maxPrice" type="number" defaultValue={maxPrice || ""} />
                </div>
                <Button type="submit" className="w-full">Apply Filters</Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/storage">Clear</Link>
                </Button>
              </form>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {spaces.length} of {pagination.total} storage spaces
            </div>
            
            {spaces.length === 0 ? (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 text-center">
                <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No storage spaces found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {spaces.map((space) => (
                  <Card key={space.id} className="overflow-hidden h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="line-clamp-2">{space.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {space.city}, {space.state}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{space.storageType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {space.description || "No description."}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        {space.lengthFt && space.widthFt && (
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <span>{space.lengthFt}' × {space.widthFt}'</span>
                          </div>
                        )}
                        {space.features && space.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {space.features.slice(0, 3).map((f) => (
                              <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold">${space.monthlyPrice}/mo</div>
                        {space.annualPrice && (
                          <div className="text-xs text-muted-foreground">${space.annualPrice}/yr</div>
                        )}
                      </div>
                      <Link href={`/storage/${space.id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
