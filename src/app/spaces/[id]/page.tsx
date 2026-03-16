import { notFound } from "next/navigation";
import { getOfficeSpace } from "@/lib/actions/office-spaces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Star, Wifi, Car, Coffee, Tv, Bath, CheckCircle } from "lucide-react";
import Image from "next/image";
import BookingWidget from "@/components/office/booking-widget";

interface SpacePageProps {
  params: Promise<{ id: string }>;
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { id } = await params;
  const space = await getOfficeSpace(id);
  
  if (!space || !space.isActive) {
    notFound();
  }

  // Split amenities into categories (simple)
  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    parking: Car,
    coffee: Coffee,
    tv: Tv,
    bathroom: Bath,
    default: CheckCircle,
  };

  const photos = space.photos && space.photos.length > 0 ? space.photos : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <nav className="mb-4">
          <a href="/spaces" className="text-primary hover:underline">← Back to all spaces</a>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-96 w-full">
                  <Image
                    src={photos[0]}
                    alt={space.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {photos.slice(1, 5).map((photo, idx) => (
                      <div key={idx} className="relative h-24">
                        <Image
                          src={photo}
                          alt={`${space.title} ${idx + 2}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Details Card */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{space.title}</h1>
                  {space.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{space.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">({space.review_count} reviews)</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{space.address}, {space.city}, {space.state} {space.zipCode}, {space.country}</span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {space.description || "No description provided."}
                </p>
              </div>

              <Separator />

              {/* Amenities */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                {space.amenities && space.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {space.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity.toLowerCase()] || amenityIcons.default;
                      return (
                        <div key={amenity} className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No amenities listed.</p>
                )}
              </div>

              <Separator />

              {/* Capacity */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Capacity</h2>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Up to {space.capacity} people</span>
                </div>
              </div>

              <Separator />

              {/* Location */}
              {space.latitude && space.longitude && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Location</h2>
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Map view coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <BookingWidget spaceId={space.id} prices={{
                hourly: space.hourlyPrice,
                daily: space.dailyPrice,
                weekly: space.weeklyPrice,
                monthly: space.monthlyPrice,
              }} />
              
              {/* Owner Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-2">About the Space</h3>
                <p className="text-sm text-muted-foreground">
                  This space is managed by the owner. Contact us for special requests or long-term rentals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
