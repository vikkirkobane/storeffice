import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase";

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
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("userType")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "owner"].includes(profile.userType)) {
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
