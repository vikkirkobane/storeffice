import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";
import { refundPayment } from "@/lib/stripe";

/**
 * POST /api/admin/transactions/refund
 * Query params: ?type=booking|order&id=<entityId>
 * Looks up associated payment and issues a full refund via Stripe.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await getUserById(payload.userId);
    if (!admin || !["admin", "owner"].includes(admin[0].userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const entityId = searchParams.get("id");

    if (!type || !entityId) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    let payment;
    if (type === "booking") {
      const booking = await db.select().from(schema.bookings).where(eq(schema.bookings.id, entityId)).limit(1).execute();
      if (!booking[0] || !booking[0].paymentId) return NextResponse.json({ error: "Booking not found or no payment" }, { status: 404 });
      payment = await db.select().from(schema.payments).where(eq(schema.payments.id, booking[0].paymentId)).limit(1).execute();
    } else if (type === "order") {
      const order = await db.select().from(schema.orders).where(eq(schema.orders.id, entityId)).limit(1).execute();
      if (!order[0] || !order[0].paymentId) return NextResponse.json({ error: "Order not found or no payment" }, { status: 404 });
      payment = await db.select().from(schema.payments).where(eq(schema.payments.id, order[0].paymentId)).limit(1).execute();
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!payment[0]) return NextResponse.json({ error: "Payment record not found" }, { status: 404 });

    // Perform refund via Stripe
    const refund = await refundPayment(payment[0].transactionId);

    // Update payment status
    await db.update(schema.payments).set({ status: "refunded" as const }).where(eq(schema.payments.id, payment[0].id));

    // Update entity status
    if (type === "booking") {
      await db.update(schema.bookings).set({ status: "cancelled" as const }).where(eq(schema.bookings.id, entityId));
    } else {
      await db.update(schema.orders).set({ status: "cancelled" as const }).where(eq(schema.orders.id, entityId));
    }

    return NextResponse.json({ ok: true, refund });
  } catch (error: any) {
    console.error("Admin refund error:", error);
    return NextResponse.json({ error: error.message || "Refund failed" }, { status: 500 });
  }
}
