import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { verifyPassword, generateAccessToken, generateRefreshToken } from "@/lib/auth-core";

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Returns: { accessToken, refreshToken, user }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await db.select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1).execute();
    if (!result.length) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result[0];
    if (!user.passwordHash) {
      return NextResponse.json({ error: "Account not set up properly" }, { status: 400 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
