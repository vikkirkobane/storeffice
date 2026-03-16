import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, inArray, sql } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { createPaymentIntent } from "@/lib/stripe";
import { sendEmail } from "@/services/email-service";

interface CartItemInput {
  productId: string;
  quantity: number;
}

/**
 * POST /api/orders/checkout
 * Creates an order and a Stripe PaymentIntent, returns client secret.
 * Expects: { items: [{ productId, quantity }], shippingAddress?: Address }
 * Returns: { orderId, clientSecret, paymentIntentId }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 checkouts per user per hour
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required. Please log in to checkout." }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const rlKey = getRateLimitKey(payload.userId, "checkout");
    const rl = rateLimit(rlKey, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    }

    const user = await getUserById(payload.userId);
    if (!user || user.length === 0 || !user[0].isActive) {
      return NextResponse.json({ error: "User not found or account disabled" }, { status: 403 });
    }

    const body = await request.json();
    const { items, shippingAddress }: { items: CartItemInput[]; shippingAddress?: any } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch product details and validate inventory
    const productIds = items.map(i => i.productId);
    const products = await db.select().from(schema.products).where(inArray(schema.products.id, productIds)).execute();
    
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
      }
      if (!product.isActive) {
        return NextResponse.json({ error: `Product ${product.title} is no longer available` }, { status: 400 });
      }
      if (product.inventory < item.quantity) {
        return NextResponse.json({ error: `Insufficient inventory for ${product.title}` }, { status: 400 });
      }
      
      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        totalPrice: subtotal,
      });
    }

    // Basic shipping address validation (could be improved)
    const address = shippingAddress || {
      fullName: user[0].fullName || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    };

    // Create order in pending status
    const [order] = await db.insert(schema.orders).values({
      customerId: user[0].id,
      totalAmount,
      shippingAddress: address,
      status: "pending", // will become 'processing' after payment
    }).returning();

    // Create order items
    await db.insert(schema.orderItems).values(
      orderItems.map(item => ({
        orderId: order.id,
        ...item,
      }))
    );

    // Create a payment record (preliminary)
    const [payment] = await db.insert(schema.payments).values({
      userId: user[0].id,
      amount: totalAmount,
      currency: "usd",
      paymentMethod: "card",
      paymentGateway: "stripe",
      transactionId: `pi_${order.id}`, // placeholder, will be replaced with real PI ID
      status: "pending",
      metadata: { orderId: order.id },
    }).returning();

    // Create Stripe PaymentIntent
    const intent = await createPaymentIntent(totalAmount, "usd", {
      userId: user[0].id,
      type: "order",
      orderId: order.id,
      paymentId: payment.id,
    });

    // Update payment with real Stripe PaymentIntent ID
    await db.update(schema.payments).set({ transactionId: intent.id }).where(eq(schema.payments.id, payment.id));
    await db.update(schema.orders).set({ paymentId: intent.id }).where(eq(schema.orders.id, order.id));

    // Return client secret to frontend
    return NextResponse.json({
      orderId: order.id,
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
