import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, officeSpaces } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { z } from "zod";

const bookingSchema = z.object({
  spaceId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

type BookingInput = z.infer<typeof bookingSchema>;

export async function createBooking(data: BookingInput) {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = bookingSchema.parse(data);

  // Fetch space to calculate price and ensure it exists
  const spaceResult = await db
    .select({
      id: officeSpaces.id,
      dailyPrice: officeSpaces.dailyPrice,
      hourlyPrice: officeSpaces.hourlyPrice,
    })
    .from(officeSpaces)
    .where(sql`${officeSpaces.id} = ${validated.spaceId}`)
    .limit(1);

  if (!spaceResult.length) throw new Error("Space not found");

  const space = spaceResult[0];

  const start = new Date(validated.startDate);
  const end = new Date(validated.endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dailyRate = space.dailyPrice || (space.hourlyPrice ? space.hourlyPrice * 24 : 0);
  const totalPrice = days * dailyRate;

  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: session.user.id,
      spaceId: validated.spaceId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    })
    .returning();

  revalidatePath("/dashboard/bookings");
  revalidatePath("/");
  return booking;
}

export async function updateBookingStatus(id: string, status: "confirmed" | "cancelled" | "completed") {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Fetch booking with space ownership
  const result = await db
    .select({
      booking: bookings,
      space: officeSpaces,
    })
    .from(bookings)
    .innerJoin(officeSpaces, sql`${officeSpaces.id} = ${bookings.spaceId}`)
    .where(sql`${bookings.id} = ${id}`)
    .limit(1);

  if (!result.length) throw new Error("Booking not found");

  const { booking, space } = result[0];

  const isOwner = space.ownerId === session.user.id;
  const isCustomer = booking.customerId === session.user.id;

  if (!isOwner && !isCustomer) throw new Error("Not authorized");
  if (isCustomer && status !== "cancelled") throw new Error("Customer can only cancel");

  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath("/dashboard/bookings");
  return updated;
}

export async function getMyBookings() {
  const session = await auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  // Bookings where user is the customer
  const asCustomer = await db
    .select({
      booking: bookings,
      space: officeSpaces,
    })
    .from(bookings)
    .innerJoin(officeSpaces, sql`${officeSpaces.id} = ${bookings.spaceId}`)
    .where(sql`${bookings.customerId} = ${session.user.id}`)
    .orderBy(sql`${bookings.created_at} DESC`);

  // Bookings for spaces owned by user
  const asOwner = await db
    .select({
      booking: bookings,
      space: officeSpaces,
    })
    .from(bookings)
    .innerJoin(officeSpaces, sql`${officeSpaces.id} = ${bookings.spaceId}`)
    .where(sql`${officeSpaces.ownerId} = ${session.user.id}`)
    .orderBy(sql`${bookings.created_at} DESC`);

  return { asCustomer, asOwner };
}

export async function getSpaceBookings(spaceId: string) {
  // For owners to see all bookings for a specific space
  return db
    .select()
    .from(bookings)
    .where(sql`space_id = ${spaceId}`)
    .orderBy(sql`start_date ASC`);
}
