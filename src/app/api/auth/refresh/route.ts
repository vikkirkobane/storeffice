import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, generateAccessToken, getUserById } from "@/lib/auth-core";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await request.cookies;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 401 }
      );
    }
    
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }
    
    // Verify user still exists
    const user = await getUserById(payload.userId);
    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }
    
    // Generate new access token
    const accessToken = await generateAccessToken({
      userId: user[0].id,
      userType: user[0].userType || "customer",
    });
    
    // Set new access token cookie (optional but convenient)
    const responseCookies = await cookies();
    responseCookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    
    return NextResponse.json(
      { accessToken, user: user[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
