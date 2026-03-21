import { getServerUser } from "@/lib/auth-core";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

// Dashboard pages require auth and DB access - dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardBookingsPage() {
  const [user] = await getServerUser();
  
  if (!user) {
    redirect("/login");
  }

  let bookings: any[] = [];
  try {
    const result = await db
      .select({
        booking: schema.bookings,
        space: schema.officeSpaces,
      })
      .from(schema.bookings)
      .leftJoin(schema.officeSpaces, eq(schema.bookings.spaceId, schema.officeSpaces.id))
      .where(eq(schema.bookings.customerId, user.id))
      .orderBy(desc(schema.bookings.createdAt))
      .execute();
    bookings = result;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    // Keep empty array on error
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your office space bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground mt-2">
              Start exploring office spaces to make your first reservation.
            </p>
            <Link href="/spaces" className="mt-4 inline-block">
              <Button>Browse Spaces</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map(({ booking, space }) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{space?.title || "Unknown Space"}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {space?.city}, {space?.state}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(booking.startDate), "MMM d, yyyy")} –{" "}
                      {format(new Date(booking.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Total: ${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/spaces/${space?.id}`} target="_blank">
                  <Button variant="outline" size="sm">View Space</Button>
                </Link>
                {booking.status === "pending" && (
                  <Button variant="destructive" size="sm">Cancel Booking</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
// Build trigger Sun Mar 22 07:37:59 +08 2026
