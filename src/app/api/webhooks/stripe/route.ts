import { NextRequest, NextResponse } from "next/server";
import { stripe, getWebhookSecret } from "@/lib/stripe";
import { db, schema } from "@/lib/db";
import { eq, sql`${Sql}` } from "drizzle-orm";
import { sendEmail } from "@/services/email-service";

// Helper to clear user's cart
async function clearUserCart(userId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
}

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events.
 * Important events:
 * - payment_intent.succeeded: mark booking/order as confirmed/completed, send emails, reduce inventory
 * - payment_intent.payment_failed: mark as failed, notify user
 * - charge.refunded: mark payment as refunded
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  const secret = getWebhookSecret();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log(`✅  Received ${event.type} event`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;
        const metadata = pi.metadata || {};
        const { type, bookingId, orderId, userId } = metadata;

        if (type === "booking" && bookingId) {
          // Update booking to confirmed
          await db.update(schema.bookings)
            .set({ status: "confirmed" as const })
            .where(eq(schema.bookings.id, bookingId));
          
          // Send confirmation email (basic HTML)
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
        } else if (type === "order" && orderId) {
          // Update order to processing
          await db.update(schema.orders)
            .set({ status: "processing" as const })
            .where(eq(schema.orders.id, orderId));

          // Reduce inventory for each order item
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

          // Clear user's cart after successful payment
          await clearUserCart(userId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const metadata = pi.metadata || {};
        const { type, bookingId, orderId, userId } = metadata;

        if (type === "booking" && bookingId) {
          await db.update(schema.bookings)
            .set({ status: "cancelled" as const })
            .where(eq(schema.bookings.id, bookingId));
          // Notify user of failure
          const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
          if (user[0]?.email) {
            const html = `
              <h1>Payment Failed</h1>
              <p>Hello ${user[0].fullName},</p>
              <p>Your payment for the booking could not be processed. The booking has been cancelled.</p>
              <p>Please try again with a different payment method.</p>
            `;
            await sendEmail({ to: user[0].email, subject: "Payment Failed - Storeffice", html });
          }
        } else if (type === "order" && orderId) {
          await db.update(schema.orders)
            .set({ status: "cancelled" as const })
            .where(eq(schema.orders.id, orderId));
          const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
          if (user[0]?.email) {
            const html = `
              <h1>Order Payment Failed</h1>
              <p>Hello ${user[0].fullName},</p>
              <p>Your order could not be completed due to a payment issue. Please try again.</p>
            `;
            await sendEmail({ to: user[0].email, subject: "Order Payment Failed - Storeffice", html });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent as string;
        if (paymentIntentId) {
          await db.update(schema.payments)
            .set({ status: "refunded" as const })
            .where(eq(schema.payments.id, paymentIntentId));
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
