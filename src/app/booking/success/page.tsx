import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookingSuccessPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle>Booking Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your booking <strong>#{searchParams.bookingId?.slice(0, 8)}</strong> is confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to you. We look forward to hosting you!
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/bookings">View Bookings</Link>
            </Button>
            <Button asChild>
              <Link href="/spaces">Explore Spaces</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
