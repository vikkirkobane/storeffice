import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * POST /api/notifications/:id/read
 * Marks a notification as read.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.update(schema.notifications).set({ isRead: true }).where(
      eq(schema.notifications.id, id).and(eq(schema.notifications.userId, user.id))
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/notifications/:id/read error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
