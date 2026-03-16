import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await db.update(schema.notifications).set({ isRead: true }).where(
      eq(schema.notifications.id, id).and(eq(schema.notifications.userId, payload.userId))
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/notifications/:id/read error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
