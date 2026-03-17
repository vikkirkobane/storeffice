import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createUser, generateAccessToken, generateRefreshToken } from "@/lib/auth-core";

/**
 * POST /api/auth/register
 * Body: { email, password, fullName, phone?, userType? }
 * Returns: { accessToken, refreshToken, user }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, userType } = await request.json();
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name required" }, { status: 400 });
    }

    const existing = await db.select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1).execute();
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser({
      email,
      password,
      fullName,
      phone,
      userType,
    });

    const accessToken = await generateAccessToken({ userId: user.id, userType: user.userType });
    const refreshToken = await generateRefreshToken({ userId: user.id });

    const response = NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
