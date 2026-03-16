import { listOfficeSpaces } from "@/lib/actions/office-spaces";
import OfficeSpaceCard from "@/components/office/office-space-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, DollarSign, LayoutGrid, Map } from "lucide-react";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/maps/OfficeSpacesMap").then(m => m.default), {
  ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-100">Loading map...</div>,
});

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
  const view = typeof params.view === "string" && ["grid", "map"].includes(params.view) ? params.view : "grid";

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Office Spaces</h1>
          <p className="text-muted-foreground mt-2">
            Browse available office spaces for rent. Filter by location, price, and capacity.
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

                <div>
                  <label htmlFor="view" className="block text-sm font-medium mb-1">View</label>
                  <Select name="view" defaultValue={view}>
                    <SelectTrigger>
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">
                        <LayoutGrid className="inline h-4 w-4 mr-2" /> Grid
                      </SelectItem>
                      <SelectItem value="map">
                        <Map className="inline h-4 w-4 mr-2" /> Map
                      </SelectItem>
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
            
            {view === "map" ? (
              <Suspense fallback={<div className="h-[600px] flex items-center justify-center bg-gray-100">Loading map...</div>}>
                <MapView spaces={spaces} onSelect={(id) => { window.location.href = `/spaces/${id}`; }} />
              </Suspense>
            ) : (
              <>
                {spaces.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No office spaces found</h3>
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
                          ...(minPrice && { minPrice: String(minPrice) }),
                          ...(maxPrice && { maxPrice: String(maxPrice) }),
                          ...(capacity && { capacity: String(capacity) }),
                          ...(sort && { sort }),
                          ...(view && { view }),
                          ...(page > 1 && { page: String(page) }),
                        })}`}
                        className={`px-3 py-2 rounded-md ${page === pagination.page ? "bg-primary text-primary-foreground" : "bg-white hover:bg-gray-100"}`}
                      >
                        {page}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
