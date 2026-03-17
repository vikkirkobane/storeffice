import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { sendEmail } from "@/services/email-service";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

// Helper to clear user's cart
async function clearUserCart(userId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
}

/**
 * GET /api/payments/callback
 * Paystack redirects here after a payment attempt.
 * Query: ?trxref=reference
 * We verify the transaction and update order/booking status accordingly.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("trxref");
  if (!reference) {
    return NextResponse.redirect(new URL("/payment/failed?error=missing_reference", request.url));
  }

  try {
    const verification = await verifyPaystackTransaction(reference);
    const transaction = verification.data;
    const isSuccess = transaction.status === "success";
    const metadata = transaction.metadata || {};
    const { type, orderId, bookingId, userId } = metadata;

    // Find payment by reference
    const payment = await db.select().from(schema.payments).where(eq(schema.payments.transactionId, reference)).limit(1).execute();
    if (!payment[0]) {
      return NextResponse.redirect(new URL("/payment/failed?error=payment_not_found", request.url));
    }

    if (isSuccess) {
      // Update payment to completed
      await db.update(schema.payments).set({ status: "completed" }).where(eq(schema.payments.id, payment[0].id));

      if (type === "order" && orderId) {
        // Update order status
        await db.update(schema.orders)
          .set({ status: "processing" as const, paymentId: reference })
          .where(eq(schema.orders.id, orderId));

        // Reduce inventory
        const orderItems = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId)).execute();
        for (const item of orderItems) {
          await db.update(schema.products)
            .set({ inventory: sql`${schema.products.inventory} - ${item.quantity}` })
            .where(eq(schema.products.id, item.productId));
        }

        // Send order confirmation email
        const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
        const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1).execute();
        if (user[0]?.email) {
          const html = `
            <h1>Order Confirmed!</h1>
            <p>Hello ${user[0].fullName},</p>
            <p>Your order #${orderId.slice(0, 8)} is now being processed.</p>
            <p><strong>Total Paid:</strong> $${Number(order[0].totalAmount).toFixed(2)}</p>
            <p>We'll notify you when your order ships.</p>
          `;
          await sendEmail({ to: user[0].email, subject: "Order Confirmed - Storeffice", html });
        }

        // Clear cart
        try {
          await clearUserCart(userId);
        } catch (e) {
          console.error("Failed to clear cart:", e);
        }

        return NextResponse.redirect(new URL(`/order/success?orderId=${orderId}`, request.url));
      }

      if (type === "booking" && bookingId) {
        // Update booking to confirmed
        await db.update(schema.bookings)
          .set({ status: "confirmed" as const, paymentId: reference })
          .where(eq(schema.bookings.id, bookingId));

        // Send booking confirmation email
        const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
        const booking = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId)).limit(1).execute();
        const space = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, booking[0].spaceId)).limit(1).execute();

        if (user[0]?.email) {
          const html = `
            <h1>Booking Confirmed!</h1>
            <p>Hello ${user[0].fullName},</p>
            <p>Your booking for <strong>${space[0].title}</strong> is confirmed.</p>
            <p><strong>Dates:</strong> ${new Date(booking[0].startDate).toLocaleDateString()} - ${new Date(booking[0].endDate).toLocaleDateString()}</p>
            <p><strong>Total Paid:</strong> $${Number(booking[0].totalPrice).toFixed(2)}</p>
            <p>Thank you for using Storeffice!</p>
          `;
          await sendEmail({ to: user[0].email, subject: "Booking Confirmed - Storeffice", html });
        }

        // Since booking may not use cart, no clearing needed
        return NextResponse.redirect(new URL(`/booking/success?bookingId=${bookingId}`, request.url));
      }
    } else {
      // Payment failed/cancelled
      await db.update(schema.payments)
        .set({ status: "failed" as const })
        .where(eq(schema.payments.id, payment[0].id));

      if (type === "order" && orderId) {
        await db.update(schema.orders)
          .set({ status: "cancelled" as const })
          .where(eq(schema.orders.id, orderId));
        await sendEmail(payment[0].userId, "Order Payment Failed", `
          <h1>Order Payment Failed</h1>
          <p>Hello,</p>
          <p>Your order could not be completed due to a payment issue. Please try again.</p>
        `);
        return NextResponse.redirect(new URL(`/payment/failed?orderId=${orderId}`, request.url));
      }

      if (type === "booking" && bookingId) {
        await db.update(schema.bookings)
          .set({ status: "cancelled" as const })
          .where(eq(schema.bookings.id, bookingId));
        await sendEmail(payment[0].userId, "Booking Payment Failed", `
          <h1>Booking Payment Failed</h1>
          <p>Hello,</p>
          <p>Your booking could not be completed due to a payment issue. Please try again.</p>
        `);
        return NextResponse.redirect(new URL(`/payment/failed?bookingId=${bookingId}`, request.url));
      }
    }

    // Fallback redirect if type unknown
    return NextResponse.redirect(new URL("/payment/failed?error=unknown_type", request.url));
  } catch (error: any) {
    console.error("Paystack callback error:", error.message, error);
    return NextResponse.redirect(new URL("/payment/failed?error=verification_failed", request.url));
  }
}

// Helper to send email (simple wrapper)
async function sendEmail(toUserId: string, subject: string, html: string) {
  // We need to get user email first
  const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, toUserId)).limit(1).execute();
  if (user[0]?.email) {
    await import("@/services/email-service").then(m => m.sendEmail({ to: user[0].email, subject, html }));
  }
}
