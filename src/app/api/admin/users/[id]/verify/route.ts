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
