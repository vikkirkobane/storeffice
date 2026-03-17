import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/auth-core";

/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 * Returns: { accessToken }
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const accessToken = await generateAccessToken({ userId: payload.userId });

    const response = NextResponse.json({ accessToken });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
