import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase-server";
import { initializePaystackTransaction } from "@/lib/paystack";
import { sendEmail } from "@/services/email-service";

export const dynamic = 'force-dynamic';

const createBookingSchema = z.object({
  spaceId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  guestCount: z.number().int().positive(),
});

/**
 * POST /api/bookings
 * Create a new booking with pending payment, returns Paystack transaction data.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get profile
    const { data: customer } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!customer || !customer.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }

    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    const spaces = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, validated.spaceId)).limit(1).execute();
    const space = spaces[0];
    if (!space || !space.isActive) {
      return NextResponse.json({ error: "Office space not found or inactive" }, { status: 404 });
    }

    // Check overlapping confirmed bookings
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

    // Calculate price
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

    // Create booking (pending)
    const [booking] = await db.insert(schema.bookings).values({
      customerId: customer.id,
      spaceId: validated.spaceId,
      startDate: startDate,
      endDate: endDate,
      guestCount: validated.guestCount,
      totalPrice,
      status: "pending",
    }).returning();

    // Create payment record (pending, Paystack)
    const [payment] = await db.insert(schema.payments).values({
      userId: customer.id,
      amount: totalPrice,
      currency: "usd",
      paymentMethod: "card",
      paymentGateway: "paystack",
      transactionId: `txn_${booking.id}`,
      status: "pending",
      metadata: { bookingId: booking.id },
    }).returning();

    // Initialize Paystack transaction
    const paystackData = await initializePaystackTransaction(
      customer.email,
      totalPrice,
      "usd",
      {
        userId: customer.id,
        type: "booking",
        bookingId: booking.id,
        paymentId: payment.id,
      }
    );

    // Update references
    await db.update(schema.payments).set({ transactionId: paystackData.reference }).where(eq(schema.payments.id, payment.id));
    await db.update(schema.bookings).set({ paymentId: paystackData.reference }).where(eq(schema.bookings.id, booking.id));

    return NextResponse.json({
      booking,
      authorizationUrl: paystackData.authorization_url,
      reference: paystackData.reference,
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
