import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * POST /api/admin/listings/products/:id/toggle
 * Toggles isActive for a product.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await getUserById(payload.userId);
    if (!admin || !["admin", "owner"].includes(admin[0].userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await db.select().from(schema.products).where(eq(schema.products.id, productId)).limit(1).execute();
    if (!product[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newStatus = !product[0].isActive;
    await db.update(schema.products).set({ isActive: newStatus }).where(eq(schema.products.id, productId));
    return NextResponse.json({ ok: true, isActive: newStatus });
  } catch (error) {
    console.error("Admin toggle product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
