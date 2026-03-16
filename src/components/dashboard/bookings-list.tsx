"use client";

import { useState } from "react";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { useRouter } from "next/navigation";

type BookingWithSpace = {
  booking: {
    id: string;
    startDate: string | Date;
    endDate: string | Date;
    totalPrice: number;
    status: string;
    createdAt: string | Date;
  };
  space: {
    title: string;
    address: string;
    city: string;
    state: string;
  };
  role: "customer" | "owner";
};

interface BookingsListProps {
  bookings: BookingWithSpace[];
}

export default function BookingsList({ bookings }: BookingsListProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (bookingId: string, status: "confirmed" | "cancelled" | "completed") => {
    setUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      router.refresh();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  if (bookings.length === 0) return <div className="text-gray-500">No bookings yet.</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {bookings.map(({ booking, space, role }) => (
          <li key={booking.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{space.title}</h3>
                  <p className="text-sm text-gray-500">
                    {space.address}, {space.city}, {space.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">${booking.totalPrice.toFixed(2)}</span>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{booking.status}</span>
                    <span className="ml-2 text-xs text-gray-500 capitalize">{role}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {role === "owner" && booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                        disabled={updating === booking.id}
                        className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                        disabled={updating === booking.id}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {role === "customer" && booking.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                      disabled={updating === booking.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === "confirmed" && role === "owner" && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, "completed")}
                      disabled={updating === booking.id}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
