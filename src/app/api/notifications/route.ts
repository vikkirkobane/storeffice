import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * GET /api/notifications
 * Returns notifications for current user, with optional unread filter.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    let query = db.select().from(schema.notifications).where(eq(schema.notifications.userId, payload.userId));
    if (unreadOnly) {
      query = query.where(eq(schema.notifications.isRead, false));
    }
    const notifications = await query.orderBy(desc(schema.notifications.createdAt)).limit(50).execute();

    const [unreadCount] = await db.select({ count: sql`count(*)` }).from(schema.notifications).where(
      eq(schema.notifications.userId, payload.userId).and(eq(schema.notifications.isRead, false))
    );

    return NextResponse.json({ notifications, unreadCount: Number(unreadCount.count) });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

/**
 * POST /api/notifications/read-all
 * Marks all notifications as read for current user.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.userId, payload.userId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/notifications/read-all error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
