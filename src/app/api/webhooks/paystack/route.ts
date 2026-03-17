import { NextRequest, NextResponse } from "next/server";
import { paystack, getPaystackWebhookSecret } from "@/lib/paystack";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { sendEmail } from "@/services/email-service";

export const dynamic = 'force-dynamic';

// Helper to clear user's cart
async function clearUserCart(userId: string) {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
}

/**
 * POST /api/webhooks/paystack
 * Handles Paystack webhook events.
 * Important events:
 * - charge.success: mark order as processing, reduce inventory, send confirmation, clear cart
 * - charge.failed: mark order/payment as failed, notify user
 * - refund.processed: mark payment as refunded
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature")!;
  const secret = getPaystackWebhookSecret();

  let event: any;
  try {
    event = paystack.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log(`✅  Received ${event.event} event`);

  try {
    switch (event.event) {
      case "charge.success": {
        const transaction = event.data;
        const reference = transaction.reference;
        const metadata = transaction.metadata || {};
        const { type, orderId, userId } = metadata;

        // Update payment to completed
        const payment = await db.select().from(schema.payments).where(eq(schema.payments.transactionId, reference)).limit(1).execute();
        if (payment[0]) {
          await db.update(schema.payments).set({ status: "completed" }).where(eq(schema.payments.id, payment[0].id));
        }

        if (type === "order" && orderId) {
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

          // Send confirmation email
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

          // Clear user's cart
          await clearUserCart(userId);
        }
        break;
      }

      case "charge.failed": {
        const transaction = event.data;
        const reference = transaction.reference;
        const metadata = transaction.metadata || {};
        const { orderId, userId } = metadata;

        if (orderId) {
          await db.update(schema.orders)
            .set({ status: "cancelled" as const })
            .where(eq(schema.orders.id, orderId));
          await db.update(schema.payments)
            .set({ status: "failed" as const })
            .where(eq(schema.payments.transactionId, reference));
        }

        // Notify user
        const user = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
        if (user[0]?.email) {
          const html = `
            <h1>Order Payment Failed</h1>
            <p>Hello ${user[0].fullName},</p>
            <p>Your order could not be completed due to a payment issue. Please try again.</p>
          `;
          await sendEmail({ to: user[0].email, subject: "Order Payment Failed - Storeffice", html });
        }
        break;
      }

      case "refund.processed": {
        // Paystack refund events link to the original transaction via 'main_transaction.reference'
        const refund = event.data;
        const mainRef = refund.main_transaction?.reference;
        if (mainRef) {
          await db.update(schema.payments)
            .set({ status: "refunded" as const })
            .where(eq(schema.payments.transactionId, mainRef));
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
