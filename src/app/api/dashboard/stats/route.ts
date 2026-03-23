import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * GET /api/dashboard/stats
 * Returns role-based statistics for the logged-in user.
 */
export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const userType = profile.user_type;

    // Build stats based on role
    let stats: any = { userType };

    if (userType === "owner") {
      const [spacesCount] = await db.select({ count: sql`count(*)` }).from(schema.officeSpaces).where(eq(schema.officeSpaces.ownerId, user.id));
      const [bookingsCount] = await db.select({ count: sql`count(*)` }).from(schema.bookings)
        .innerJoin(schema.officeSpaces, eq(schema.bookings.spaceId, schema.officeSpaces.id))
        .where(eq(schema.officeSpaces.ownerId, user.id));
      const [revenueSum] = await db.select({ sum: sql`sum(total_price)` }).from(schema.bookings)
        .innerJoin(schema.officeSpaces, eq(schema.bookings.spaceId, schema.officeSpaces.id))
        .where(and(eq(schema.officeSpaces.ownerId, user.id), eq(schema.bookings.status, "confirmed")));

      stats.spaces = Number(spacesCount.count) || 0;
      stats.bookings = Number(bookingsCount.count) || 0;
      stats.revenue = Number(revenueSum.sum) || 0;
    } else if (userType === "merchant") {
      const [productsCount] = await db.select({ count: sql`count(*)` }).from(schema.products).where(eq(schema.products.merchantId, user.id));
      const [ordersCount] = await db.select({ count: sql`count(*)` }).from(schema.orders)
        .innerJoin(schema.orderItems, eq(schema.orders.id, schema.orderItems.orderId))
        .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
        .where(eq(schema.products.merchantId, user.id));
      const [salesSum] = await db.select({ sum: sql`sum(total_amount)` }).from(schema.orders)
        .innerJoin(schema.orderItems, eq(schema.orders.id, schema.orderItems.orderId))
        .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
        .where(and(eq(schema.products.merchantId, user.id), eq(schema.orders.status, "processing")));

      stats.products = Number(productsCount.count) || 0;
      stats.orders = Number(ordersCount.count) || 0;
      stats.sales = Number(salesSum.sum) || 0;
    } else {
      // Customer
      const [bookingsCount] = await db.select({ count: sql`count(*)` }).from(schema.bookings).where(eq(schema.bookings.customerId, user.id));
      const [ordersCount] = await db.select({ count: sql`count(*)` }).from(schema.orders).where(eq(schema.orders.customerId, user.id));

      stats.bookings = Number(bookingsCount.count) || 0;
      stats.orders = Number(ordersCount.count) || 0;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
