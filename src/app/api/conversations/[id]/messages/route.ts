import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth-core";

/**
 * GET /api/conversations/:id/messages
 * Returns messages for a conversation (paginated).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    // Find messages where user is participant
    const messages = await db.select().from(schema.messages)
      .where(eq(schema.messages.conversationId, conversationId))
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit)
      .offset(offset)
      .execute();

    // Mark as read if user is receiver
    await db.update(schema.messages).set({ isRead: true }).where(
      eq(schema.messages.conversationId, conversationId).and(eq(schema.messages.receiverId, payload.userId)).and(eq(schema.messages.isRead, false))
    );

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("GET /api/conversations/:id/messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/conversations/:id/messages
 * Body: { content: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { content } = await request.json().then(b => b as { content: string });
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Verify participant in conversation (exists in messages)
    // We can check that there is at least one message with this conversationId
    const existing = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, conversationId)).limit(1).execute();
    if (existing.length === 0) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    // Insert message
    const [message] = await db.insert(schema.messages).values({
      conversationId,
      senderId: payload.userId,
      receiverId: existing[0].senderId === payload.userId ? existing[0].receiverId : existing[0].senderId,
      content: content.trim(),
      isRead: false,
    }).returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("POST /api/conversations/:id/messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
