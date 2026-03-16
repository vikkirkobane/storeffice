import Link from "next/link";
import { MapPin, Users, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OfficeSpace } from "@/lib/db/schema";

interface OfficeSpaceCardProps {
  space: OfficeSpace;
}

export default function OfficeSpaceCard({ space }: OfficeSpaceCardProps) {
  const firstPhoto = space.photos && space.photos.length > 0 ? space.photos[0] : null;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={space.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {space.rating > 0 && (
          <Badge className="absolute top-2 right-2 bg-white text-black flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {space.rating.toFixed(1)}
          </Badge>
        )}
      </div>
      
      <CardHeader className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{space.title}</h3>
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {space.city}, {space.state}
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {space.description || "No description provided."}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Up to {space.capacity} people
          </Badge>
          {space.amenities && space.amenities.length > 0 && (
            <Badge variant="outline">{space.amenities.length} amenities</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="flex flex-col">
          {space.hourlyPrice && (
            <span className="text-lg font-bold">${space.hourlyPrice}/hr</span>
          )}
          {!space.hourlyPrice && space.dailyPrice && (
            <span className="text-lg font-bold">${space.dailyPrice}/day</span>
          )}
          {!space.hourlyPrice && !space.dailyPrice && space.monthlyPrice && (
            <span className="text-lg font-bold">${space.monthlyPrice}/mo</span>
          )}
          <span className="text-xs text-muted-foreground">Price starting at</span>
        </div>
        
        <Link href={`/spaces/${space.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
