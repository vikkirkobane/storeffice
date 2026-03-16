import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";
import { refundPayment } from "@/lib/stripe";
import { requireRole } from "@/lib/auth-middleware"; // We'll create if missing

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/[id]/refund
 * Refund a payment (full or partial). Admin or the original payer can refund.
 * Body: { amount?: number } (partial refund in dollars; omit for full)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentIntentId } = await params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Allow refund by:
    // - The user who made the payment (userId matches payment.userId)
    // - Admin users
    const payment = await db.select().from(schema.payments).where(eq(schema.payments.id, paymentIntentId)).limit(1).execute();
    if (!payment[0]) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const isAdmin = payload.userRoles?.includes("admin");
    const isOwner = payment[0].userId === payload.userId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not authorized to refund this payment" }, { status: 403 });
    }

    const { amount } = await request.json().then(b => b as { amount?: number });

    const refund = await refundPayment(paymentIntentId, amount);

    // Update payment status to refunded (or partially refunded) if full
    if (!amount || amount >= Number(payment[0].amount)) {
      await db.update(schema.payments).set({ status: "refunded" }).where(eq(schema.payments.id, paymentIntentId));
    } else {
      // Keep as completed but note partial; we could add a refunds table for tracking
      // For now, just log
      console.log(`Partial refund processed for payment ${paymentIntentId}: $${amount}`);
    }

    return NextResponse.json({ success: true, refund });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: error.message || "Refund failed" }, { status: 500 });
  }
}
