import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase";

/**
 * POST /api/admin/listings/office-spaces/:id/toggle
 * Toggles isActive for an office space.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params;
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

    const space = await db.select().from(schema.officeSpaces).where(eq(schema.officeSpaces.id, spaceId)).limit(1).execute();
    if (!space[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newStatus = !space[0].isActive;
    await db.update(schema.officeSpaces).set({ isActive: newStatus }).where(eq(schema.officeSpaces.id, spaceId));
    return NextResponse.json({ ok: true, isActive: newStatus });
  } catch (error) {
    console.error("Admin toggle office space error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
