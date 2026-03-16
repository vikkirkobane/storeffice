import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

/**
 * PUT /api/cart/[productId]
 * Body: { quantity: number }
 * Updates quantity. Set quantity=0 to remove.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { quantity } = await request.json().then(b => b as { quantity: number });

    if (quantity <= 0) {
      // Delete
      await db.delete(schema.cartItems).where(
        eq(schema.cartItems.userId, payload.userId).and(eq(schema.cartItems.productId, productId))
      );
      return NextResponse.json({ removed: true });
    }

    // Update
    const [item] = await db.update(schema.cartItems)
      .set({ quantity })
      .where(
        eq(schema.cartItems.userId, payload.userId).and(eq(schema.cartItems.productId, productId))
      )
      .returning();

    return NextResponse.json({ item });
  } catch (error) {
    console.error("PUT /api/cart/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/[productId]
 * Removes cart item.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await db.delete(schema.cartItems).where(
      eq(schema.cartItems.userId, payload.userId).and(eq(schema.cartItems.productId, productId))
    );

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("DELETE /api/cart/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
