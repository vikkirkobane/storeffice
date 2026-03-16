"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface BookingWidgetProps {
  spaceId: string;
  prices: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
}

export default function BookingWidget({ spaceId, prices }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);

  // Determine price unit
  const getPrice = () => {
    if (prices.hourly) return { amount: prices.hourly, unit: "hour" };
    if (prices.daily) return { amount: prices.daily, unit: "day" };
    if (prices.monthly) return { amount: prices.monthly, unit: "month" };
    return { amount: 0, unit: "custom" };
  };

  const priceInfo = getPrice();

  // Calculate total days
  const days = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = priceInfo.amount && days > 0 ? priceInfo.amount * days : 0;

  const handleBook = async () => {
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
          spaceId,
          startDate: checkIn.toISOString(),
          endDate: checkOut.toISOString(),
          guestCount: guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      toast.success("Booking request submitted! Check your email for confirmation.");
      // Optionally redirect to /dashboard/bookings
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this space</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={{ before: checkIn || new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="guests">Guests</Label>
          <input
            id="guests"
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {priceInfo.amount > 0 && checkIn && checkOut && days > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{priceInfo.amount} {priceInfo.unit} × {days} {priceInfo.unit === "day" ? "days" : priceInfo.unit === "hour" ? "hours" : "months"}</span>
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
        <Button className="w-full" onClick={handleBook} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request Booking
        </Button>
      </CardFooter>
    </Card>
  );
}
