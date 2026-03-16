import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, and, sql`${Sql}` } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * GET /api/dashboard/stats
 * Returns role-based statistics for the logged-in user.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await getUserById(payload.userId);
    if (!user || user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const userRecord = user[0];
    const userType = userRecord.userType;

    // Build stats based on role
    let stats: any = { userType };

    if (userType === "owner") {
      const [spacesCount] = await db.select({ count: sql`count(*)` }).from(schema.officeSpaces).where(eq(schema.officeSpaces.ownerId, userRecord.id));
      const [bookingsCount] = await db.select({ count: sql`count(*)` }).from(schema.bookings)
        .innerJoin(schema.officeSpaces, eq(schema.bookings.spaceId, schema.officeSpaces.id))
        .where(eq(schema.officeSpaces.ownerId, userRecord.id));
      const [revenueSum] = await db.select({ sum: sql`sum(total_price)` }).from(schema.bookings)
        .innerJoin(schema.officeSpaces, eq(schema.bookings.spaceId, schema.officeSpaces.id))
        .where(and(eq(schema.officeSpaces.ownerId, userRecord.id), eq(schema.bookings.status, "confirmed")));

      stats.spaces = Number(spacesCount.count) || 0;
      stats.bookings = Number(bookingsCount.count) || 0;
      stats.revenue = Number(revenueSum.sum) || 0;
    } else if (userType === "merchant") {
      const [productsCount] = await db.select({ count: sql`count(*)` }).from(schema.products).where(eq(schema.products.merchantId, userRecord.id));
      const [ordersCount] = await db.select({ count: sql`count(*)` }).from(schema.orders)
        .innerJoin(schema.orderItems, eq(schema.orders.id, schema.orderItems.orderId))
        .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
        .where(eq(schema.products.merchantId, userRecord.id));
      const [salesSum] = await db.select({ sum: sql`sum(total_amount)` }).from(schema.orders)
        .innerJoin(schema.orderItems, eq(schema.orders.id, schema.orderItems.orderId))
        .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
        .where(and(eq(schema.products.merchantId, userRecord.id), eq(schema.orders.status, "processing")));

      stats.products = Number(productsCount.count) || 0;
      stats.orders = Number(ordersCount.count) || 0;
      stats.sales = Number(salesSum.sum) || 0;
    } else {
      // Customer
      const [bookingsCount] = await db.select({ count: sql`count(*)` }).from(schema.bookings).where(eq(schema.bookings.customerId, userRecord.id));
      const [ordersCount] = await db.select({ count: sql`count(*)` }).from(schema.orders).where(eq(schema.orders.customerId, userRecord.id));

      stats.bookings = Number(bookingsCount.count) || 0;
      stats.orders = Number(ordersCount.count) || 0;
    }

    // We could also fetch recent bookings/orders here if needed

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
