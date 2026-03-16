import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

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
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await getUserById(payload.userId);
    if (!admin || !["admin", "owner"].includes(admin[0].userType)) {
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
