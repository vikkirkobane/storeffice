import { notFound } from "next/navigation";
import { getStorageSpace } from "@/lib/actions/storage-spaces";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Ruler, CheckCircle, Calendar, DollarSign } from "lucide-react";

interface StorageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StorageDetailPage({ params }: StorageDetailPageProps) {
  const { id } = await params;
  const space = await getStorageSpace(id);
  
  if (!space || !space.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-4">
          <a href="/storage" className="text-primary hover:underline">← Back to all storage spaces</a>
        </nav>

        <div className="bg-white rounded-lg shadow p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{space.storageType}</Badge>
                {space.isAvailable ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="secondary">Rented</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{space.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {space.address}, {space.city}, {space.state} {space.zipCode}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">${space.monthlyPrice}/mo</div>
              {space.annualPrice && (
                <div className="text-sm text-muted-foreground">${space.annualPrice}/year (10% off)</div>
              )}
            </div>
          </div>

          <Separator />

          {space.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line text-muted-foreground">{space.description}</p>
            </div>
          )}

          <Separator />

          {/* Dimensions */}
          {(space.lengthFt || space.widthFt || space.heightFt) && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Dimensions</h2>
              <div className="grid grid-cols-3 gap-4">
                {space.lengthFt && (
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-sm text-muted-foreground">Length</div>
                    <div className="text-xl font-bold">{space.lengthFt} ft</div>
                  </div>
                )}
                {space.widthFt && (
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-sm text-muted-foreground">Width</div>
                    <div className="text-xl font-bold">{space.widthFt} ft</div>
                  </div>
                )}
                {space.heightFt && (
                  <div className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-sm text-muted-foreground">Height</div>
                    <div className="text-xl font-bold">{space.heightFt} ft</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Features */}
          {space.features && space.features.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {space.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="capitalize">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Availability */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Availability</h2>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {space.isAvailable 
                  ? "Available now" 
                  : "Currently rented. Contact owner for waitlist."}
              </span>
            </div>
          </div>

          <Separator />

          {/* Contact / Rent CTA */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Ready to rent this space?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact the owner to discuss rental terms, schedule a tour, or proceed with booking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1">
                <DollarSign className="mr-2 h-4 w-4" />
                Request Rental
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">Log in to Manage</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
