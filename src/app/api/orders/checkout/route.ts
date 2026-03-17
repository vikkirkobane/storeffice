import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, inArray, sql } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { initializePaystackTransaction } from "@/lib/paystack";
import { sendEmail } from "@/services/email-service";

export const dynamic = 'force-dynamic';

interface CartItemInput {
  productId: string;
  quantity: number;
}

/**
 * POST /api/orders/checkout
 * Creates an order and initializes a Paystack transaction.
 * Expects: { items: [{ productId, quantity }], shippingAddress?: Address }
 * Returns: { orderId, authorizationUrl, reference, amount }
 */
export async function POST(request: NextRequest) {
  try {
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

    // Fetch products and validate
    const productIds = items.map(i => i.productId);
    const products = await db.select().from(schema.products).where(inArray(schema.products.id, productIds)).execute();
    const productMap = new Map(products.map(p => [p.id, p]));

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

    const address = shippingAddress || {
      fullName: user[0].fullName || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    };

    // Create order (pending)
    const [order] = await db.insert(schema.orders).values({
      customerId: user[0].id,
      totalAmount,
      shippingAddress: address,
      status: "pending",
    }).returning();

    // Create order items
    await db.insert(schema.orderItems).values(
      orderItems.map(item => ({
        orderId: order.id,
        ...item,
      }))
    );

    // Create payment record (pending, gateway = paystack)
    const [payment] = await db.insert(schema.payments).values({
      userId: user[0].id,
      amount: totalAmount,
      currency: "usd",
      paymentMethod: "card",
      paymentGateway: "paystack",
      transactionId: `txn_${order.id}`, // temporary; will be replaced with Paystack reference
      status: "pending",
      metadata: { orderId: order.id },
    }).returning();

    // Initialize Paystack transaction
    const paystackData = await initializePaystackTransaction(
      user[0].email,
      totalAmount,
      "usd",
      {
        userId: user[0].id,
        type: "order",
        orderId: order.id,
        paymentId: payment.id,
      }
    );

    // Update payment and order with Paystack reference
    await db.update(schema.payments).set({ transactionId: paystackData.reference }).where(eq(schema.payments.id, payment.id));
    await db.update(schema.orders).set({ paymentId: paystackData.reference }).where(eq(schema.orders.id, order.id));

    return NextResponse.json({
      orderId: order.id,
      authorizationUrl: paystackData.authorization_url,
      reference: paystackData.reference,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
