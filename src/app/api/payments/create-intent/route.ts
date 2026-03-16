import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";
import { createPaymentIntent, getWebhookSecret } from "@/lib/stripe";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a booking or order.
 * Body: { type: "booking" | "order", id: uuid }
 * Returns: { clientSecret: string, paymentIntentId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 intents per hour per user
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const rlKey = getRateLimitKey(payload.userId, "create-intent");
    const rl = rateLimit(rlKey, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many payment attempts" }, { status: 429 });
    }

    const user = await getUserById(payload.userId);
    if (!user?.[0]?.isActive) {
      return NextResponse.json({ error: "User not found or disabled" }, { status: 403 });
    }

    const { type, id } = await request.json().then(b => b as { type: "booking" | "order"; id: string });
    if (type !== "booking" && type !== "order") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    let amount = 0;
    let metadata: Record<string, string> = { userId: payload.userId, type };

    if (type === "booking") {
      const booking = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1).execute();
      if (!booking[0]) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      // Ensure booking belongs to user (or user is owner of space? For now: only customer can pay)
      if (booking[0].customerId !== payload.userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
      amount = Number(booking[0].totalPrice);
      metadata.bookingId = id;
    } else {
      const order = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1).execute();
      if (!order[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (order[0].customerId !== payload.userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
      amount = Number(order[0].totalAmount);
      metadata.orderId = id;
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const intent = await createPaymentIntent(amount, "usd", metadata);

    // Store payment intent ID on the booking/order for later matching (optional)
    if (type === "booking") {
      await db.update(schema.bookings).set({ paymentId: intent.id }).where(eq(schema.bookings.id, id));
    } else {
      await db.update(schema.orders).set({ paymentId: intent.id }).where(eq(schema.orders.id, id));
    }

    return NextResponse.json({
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
      amount,
    });
  } catch (error: any) {
    console.error("Create PaymentIntent error:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment intent" }, { status: 500 });
  }
}
