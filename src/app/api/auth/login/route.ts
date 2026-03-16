import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyPassword, generateAccessToken, generateRefreshToken, getUserByEmail } from "@/lib/auth-core";
import { eq } from "drizzle-orm";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 logins per IP per 15 minutes
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rlKey = getRateLimitKey(ip, "login");
    const rl = rateLimit(rlKey, 10, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const validated = loginSchema.parse(body);
    
    // Find user
    const users = await getUserByEmail(validated.email);
    const user = users[0];
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(validated.password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      userType: user.userType || "customer",
    });
    
    const refreshToken = await generateRefreshToken({
      userId: user.id,
    });
    
    // Set HttpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });
    
    // Return user (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json(
      { user: userWithoutPassword, accessToken },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
