import { Suspense } from "react";
import { getMyBookings } from "@/lib/actions/bookings";
import BookingsList from "@/components/dashboard/bookings-list";

export default async function BookingsPage() {
  const { asCustomer, asOwner } = await getMyBookings();
  const allBookings = [
    ...asCustomer.map((b) => ({ ...b.booking, space: b.space, role: "customer" as const })),
    ...asOwner.map((b) => ({ ...b.booking, space: b.space, role: "owner" as const })),
  ].sort((a, b) => new Date(b.booking.createdAt).getTime() - new Date(a.booking.createdAt).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>

      <Suspense fallback={<div className="text-gray-500">Loading bookings...</div>}>
        <BookingsList bookings={allBookings} />
      </Suspense>
    </div>
  );
}
