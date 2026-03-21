import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase-server";
import { refundPaystackTransaction } from "@/lib/paystack";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/transactions/refund
 * Query params: ?type=booking|order&id=<entityId>
 * Looks up associated payment (by reference) and issues a full refund via Paystack.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("userType")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "owner"].includes(profile.userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const entityId = searchParams.get("id");

    if (!type || !entityId) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    let paymentRecord;
    if (type === "booking") {
      const booking = await db.select().from(schema.bookings).where(eq(schema.bookings.id, entityId)).limit(1).execute();
      if (!booking[0] || !booking[0].paymentId) return NextResponse.json({ error: "Booking not found or no payment" }, { status: 404 });
      paymentRecord = await db.select().from(schema.payments).where(eq(schema.payments.id, booking[0].paymentId)).limit(1).execute();
    } else if (type === "order") {
      const order = await db.select().from(schema.orders).where(eq(schema.orders.id, entityId)).limit(1).execute();
      if (!order[0] || !order[0].paymentId) return NextResponse.json({ error: "Order not found or no payment" }, { status: 404 });
      paymentRecord = await db.select().from(schema.payments).where(eq(schema.payments.id, order[0].paymentId)).limit(1).execute();
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!paymentRecord[0]) return NextResponse.json({ error: "Payment record not found" }, { status: 404 });

    // Paystack amounts are in the smallest unit (cents). If we want full refund, omit amount.
    const refund = await refundPaystackTransaction(paymentRecord[0].transactionId);

    // Update payment status to refunded
    await db.update(schema.payments).set({ status: "refunded" as const }).where(eq(schema.payments.id, paymentRecord[0].id));

    // Update entity status to cancelled
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
