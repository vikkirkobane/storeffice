import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * Helper: get or create conversation between two users
 */
async function getOrCreateConversation(userId: string, otherUserId: string) {
  // Check existing conversation (messages where (sender=userId AND receiver=other) OR vice versa)
  const existing = await db.select().from(schema.messages)
    .where(
      sql`(${schema.messages.senderId} = ${userId} AND ${schema.messages.receiverId} = ${otherUserId}) OR (${schema.messages.senderId} = ${otherUserId} AND ${schema.messages.receiverId} = ${userId})`
    )
    .limit(1)
    .execute();

  if (existing.length > 0) {
    // We'll use the conversationId of the latest message
    return existing[0].conversationId;
  }

  // Create new conversation by generating a UUID
  const conversationId = crypto.randomUUID();
  return conversationId;
}

/**
 * GET /api/conversations
 * Returns list of conversations for current user with last message and unread counts.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get distinct conversationIds where user is sender or receiver
    const messages = await db.select({
      conversationId: schema.messages.conversationId,
      senderId: schema.messages.senderId,
      receiverId: schema.messages.receiverId,
      content: schema.messages.content,
      createdAt: schema.messages.createdAt,
      isRead: schema.messages.isRead,
    }).from(schema.messages)
      .where(
        sql`${schema.messages.senderId} = ${payload.userId} OR ${schema.messages.receiverId} = ${payload.userId}`
      )
      .orderBy(desc(schema.messages.createdAt))
      .limit(100)
      .execute();

    // Group by conversationId, get last message and unread count
    const conversations = new Map<string, any>();
    for (const msg of messages) {
      if (!conversations.has(msg.conversationId)) {
        const otherParticipantId = msg.senderId === payload.userId ? msg.receiverId : msg.senderId;
        conversations.set(msg.conversationId, {
          conversationId: msg.conversationId,
          otherParticipantId,
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: msg.receiverId === payload.userId && !msg.isRead ? 1 : 0,
        });
      } else {
        const conv = conversations.get(msg.conversationId)!;
        if (msg.receiverId === payload.userId && !msg.isRead) {
          conv.unread += 1;
        }
      }
    }

    // Fetch other participant names/avatars
    const result = await Promise.all(Array.from(conversations.values()).map(async (conv) => {
      const user = await getUserById(conv.otherParticipantId);
      return {
        ...conv,
        otherParticipant: user?.[0] ? { fullName: user[0].fullName, email: user[0].email } : null,
      };
    }));

    return NextResponse.json({ conversations: result.sort((a,b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()) });
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Body: { participantId: string; message?: string }
 * Returns conversationId and optionally sends initial message.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { participantId, message } = await request.json().then(b => b as { participantId: string; message?: string });
    if (!participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 });

    // Check participant exists
    const participant = await getUserById(participantId);
    if (!participant?.[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get or create conversationId
    const conversationId = await getOrCreateConversation(payload.userId, participantId);

    // If initial message provided, insert it
    if (message) {
      await db.insert(schema.messages).values({
        conversationId,
        senderId: payload.userId,
        receiverId: participantId,
        content: message,
        isRead: false,
      });
    }

    return NextResponse.json({ conversationId, participant: participant[0] });
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
