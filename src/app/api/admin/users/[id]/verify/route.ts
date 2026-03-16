import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * POST /api/admin/users/:id/verify
 * Marks user's email as verified.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await getUserById(payload.userId);
    if (!admin || !["admin", "owner"].includes(admin[0].userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.update(schema.profiles).set({ emailVerified: true }).where(eq(schema.profiles.id, targetUserId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin verify user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await getUserById(payload.userId);
    if (!admin || !["admin", "owner"].includes(admin[0].userType)) {
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
