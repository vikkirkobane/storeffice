import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

/**
 * GET /api/auth/session
 * Returns current user if access token cookie is valid.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(payload.userId);
  if (!user || user.length === 0) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user[0].id,
      email: user[0].email,
      fullName: user[0].fullName,
      userType: user[0].userType,
      avatarUrl: user[0].avatarUrl,
      isVerified: user[0].isVerified,
    },
  });
}
