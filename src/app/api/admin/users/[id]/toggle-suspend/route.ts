import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase";

/**
 * POST /api/admin/users/:id/toggle-suspend
 * Toggles isActive flag.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
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

    // Fetch current state
    const target = await db.select().from(schema.profiles).where(eq(schema.profiles.id, targetUserId)).limit(1).execute();
    if (!target[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newStatus = !target[0].isActive;
    await db.update(schema.profiles).set({ isActive: newStatus }).where(eq(schema.profiles.id, targetUserId));
    return NextResponse.json({ ok: true, isActive: newStatus });
  } catch (error) {
    console.error("Admin suspend user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
