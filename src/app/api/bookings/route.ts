import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";
import { createPaymentIntent } from "@/lib/stripe";
import { sendEmail } from "@/services/email-service";

const createBookingSchema = z.object({
  spaceId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  guestCount: z.number().int().positive(),
});

/**
 * POST /api/bookings
 * Create a new booking with pending payment, returns PaymentIntent client secret.
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify token
    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const user = await getUserById(payload.userId);
    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const customer = user[0];
    if (!customer.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    // Fetch office space and validate active
    const spaces = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, validated.spaceId)).limit(1).execute();
    const space = spaces[0];
    if (!space || !space.isActive) {
      return NextResponse.json({ error: "Office space not found or inactive" }, { status: 404 });
    }

    // Check for overlapping confirmed bookings
    // Overlap condition: existing.start < new.end AND existing.end > new.start
    const overlapping = await db.select().from(schema.bookings).where(
      and(
        eq(schema.bookings.spaceId, validated.spaceId),
        eq(schema.bookings.status, "confirmed"),
        sql`${schema.bookings.startDate} < ${new Date(validated.endDate)}`,
        sql`${schema.bookings.endDate} > ${new Date(validated.startDate)}`
      )
    ).execute();

    if (overlapping.length > 0) {
      return NextResponse.json({ error: "Selected dates conflict with an existing booking" }, { status: 409 });
    }

    // Calculate total price based on duration
    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const pricePerDay = Number(space.dailyPrice) || (Number(space.hourlyPrice) * 24);
    if (!pricePerDay || pricePerDay <= 0) {
      return NextResponse.json({ error: "Space has no pricing configured" }, { status: 400 });
    }
    const totalPrice = pricePerDay * days;

    // Create booking with pending status
    const [booking] = await db.insert(schema.bookings).values({
      customerId: customer.id,
      spaceId: validated.spaceId,
      startDate: startDate,
      endDate: endDate,
      totalPrice,
      status: "pending",
    }).returning();

    // Create a preliminary payment record
    const [payment] = await db.insert(schema.payments).values({
      userId: customer.id,
      amount: totalPrice,
      currency: "usd",
      paymentMethod: "card",
      paymentGateway: "stripe",
      transactionId: `pi_${booking.id}`,
      status: "pending",
      metadata: { bookingId: booking.id },
    }).returning();

    // Create Stripe PaymentIntent
    const intent = await createPaymentIntent(totalPrice, "usd", {
      userId: customer.id,
      type: "booking",
      bookingId: booking.id,
      paymentId: payment.id,
    });

    // Update payment and booking with PI ID
    await db.update(schema.payments).set({ transactionId: intent.id }).where(eq(schema.payments.id, payment.id));
    await db.update(schema.bookings).set({ paymentId: intent.id }).where(eq(schema.bookings.id, booking.id));

    // Return client secret for frontend to complete payment
    return NextResponse.json({
      booking,
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
      amount: totalPrice,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
