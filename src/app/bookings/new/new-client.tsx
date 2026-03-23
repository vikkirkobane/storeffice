"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Loader2, ArrowLeft, Users, MapPin } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

type OfficeSpace = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  photos?: string[] | null;
  amenities?: string[] | null;
  capacity: number;
  hourlyPrice?: number | null;
  dailyPrice?: number | null;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
};

interface NewBookingClientProps {
  space: OfficeSpace;
}

export default function NewBookingClient({ space }: NewBookingClientProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  const getPrice = () => {
    if (space.hourlyPrice) return { amount: Number(space.hourlyPrice), unit: "hour" };
    if (space.dailyPrice) return { amount: Number(space.dailyPrice), unit: "day" };
    if (space.monthlyPrice) return { amount: Number(space.monthlyPrice), unit: "month" };
    return { amount: 0, unit: "custom" };
  };

  const priceInfo = getPrice();
  const days = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = priceInfo.amount && days > 0 ? priceInfo.amount * days : 0;

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: space.id,
          startDate: checkIn.toISOString(),
          endDate: checkOut.toISOString(),
          guestCount: guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Booking request submitted! Redirecting...");
      setTimeout(() => {
        router.push(`/booking/success?bookingId=${data.booking.id}`);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-teal-500/5 blur-[120px] rounded-full animate-pulse-slow delayed-1000" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Space Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">{space.title}</h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {space.address}, {space.city}, {space.state} {space.zipCode}
              </p>
            </div>

            {space.photos?.[0] && (
              <img src={space.photos[0]} alt={space.title} className="w-full h-64 object-cover rounded-lg" />
            )}

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-3">About this space</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">{space.description || "No description provided."}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {space.amenities?.map((amenity: string) => (
                  <Badge key={amenity} variant="secondary" className="px-3 py-1">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacity: {space.capacity} people</span>
                </div>
              </div>
            </div>

            <div className="bg-card/50 border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-3">Cancellation Policy</h2>
              <p className="text-sm text-muted-foreground">
                Free cancellation up to 24 hours before check-in. Cancellations within 24 hours are non-refundable.
              </p>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book this space</CardTitle>
                <CardDescription>Select your dates and guest count</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={checkIn ? format(checkIn, "yyyy-MM-dd") : ""}
                    onChange={(e) => e.target.value && setCheckIn(new Date(e.target.value))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-out</label>
                  <input
                    type="date"
                    min={checkIn ? format(checkIn, "yyyy-MM-dd") : ""}
                    value={checkOut ? format(checkOut, "yyyy-MM-dd") : ""}
                    onChange={(e) => e.target.value && e.target.value >= (checkIn ? format(checkIn, "yyyy-MM-dd") : "") && setCheckOut(new Date(e.target.value))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={space.capacity}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-2 border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max: {space.capacity} people</p>
                </div>

                {priceInfo.amount > 0 && checkIn && checkOut && days > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${priceInfo.amount} per {priceInfo.unit} × {days} {priceInfo.unit === "day" ? "days" : priceInfo.unit === "hour" ? "hours" : "months"}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleBooking} 
                  disabled={loading || !checkIn || !checkOut || days <= 0}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request Booking
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
