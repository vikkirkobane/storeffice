import { listOfficeSpaces } from "@/lib/actions/office-spaces";
import OfficeSpaceCard from "@/components/office/office-space-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, DollarSign } from "lucide-react";

interface SpacesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;
  const capacity = typeof params.capacity === "string" ? Number(params.capacity) : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "relevance";

  const { spaces, pagination } = await listOfficeSpaces({
    city,
    minPrice,
    maxPrice,
    capacity,
    sort,
    page: 1,
    limit: 100,
  });

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Office Spaces</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Premium workspaces designed for productivity. Filter by location, price, and capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Search className="h-5 w-5" /> Filters
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <Input id="city" name="city" placeholder="e.g., Nairobi" defaultValue={city || ""} />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium mb-1">
                    <Users className="inline h-4 w-4 mr-1" /> Capacity (min)
                  </label>
                  <Input id="capacity" name="capacity" type="number" placeholder="e.g., 10" defaultValue={capacity || ""} />
                </div>
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium mb-1">
                    <DollarSign className="inline h-4 w-4 mr-1" /> Min Price (hourly)
                  </label>
                  <Input id="minPrice" name="minPrice" type="number" placeholder="0" defaultValue={minPrice || ""} />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">
                    Max Price (hourly)
                  </label>
                  <Input id="maxPrice" name="maxPrice" type="number" placeholder="e.g., 100" defaultValue={maxPrice || ""} />
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
                      <SelectItem value="capacity_desc">Capacity: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">Apply Filters</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => { window.location.href = "/spaces"; }}>
                  Clear
                </Button>
              </form>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
              <span>Showing {spaces.length} of {pagination.total} spaces</span>
            </div>
            
            {spaces.length === 0 ? (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No office spaces found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {spaces.map((space) => (
                  <OfficeSpaceCard key={space.id} space={space} />
                ))}
              </div>
            )}
            
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={`?${new URLSearchParams({
                      ...(city && { city }),
                      ...(capacity && { capacity: String(capacity) }),
                      ...(minPrice && { minPrice: String(minPrice) }),
                      ...(maxPrice && { maxPrice: String(maxPrice) }),
                      sort,
                      page: String(page),
                    })}`}
                    className={`px-3 py-1 rounded transition-colors ${page === pagination.page ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"}`}
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
