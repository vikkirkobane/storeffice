import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * GET /api/cart
 * Returns current user's cart items with product details.
 */
export async function GET() {
  // ... existing code
}

/**
 * POST /api/cart
 * Body: { productId: string; quantity?: number }
 * Creates or updates cart item.
 */
export async function POST(request: NextRequest) {
  // ... existing code
}

/**
 * DELETE /api/cart
 * Clears all cart items for the current user.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await db.delete(schema.cartItems).where(eq(schema.cartItems.userId, payload.userId));
    return NextResponse.json({ cleared: true });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
