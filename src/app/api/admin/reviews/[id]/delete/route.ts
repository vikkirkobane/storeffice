import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase";

/**
 * POST /api/admin/reviews/:id/delete
 * Deletes a review. Admin/owner only.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("userType")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "owner"].includes(profile.userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(schema.reviews).where(eq(schema.reviews.id, reviewId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
