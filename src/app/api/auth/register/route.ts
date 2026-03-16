import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { hashPassword, generateAccessToken, generateRefreshToken, getUserByEmail } from "@/lib/auth-core";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  userType: z.enum(["customer", "owner", "merchant"]).default("customer"),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 registrations per IP per hour
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rlKey = getRateLimitKey(ip, "register");
    const rl = rateLimit(rlKey, 5, 60 * 60 * 1000); // 5 per hour
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const validated = registerSchema.parse(body);
    
    // Check if user exists
    const existing = await getUserByEmail(validated.email);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(validated.password);
    
    // Create user
    const [user] = await db.insert(schema.profiles).values({
      email: validated.email,
      fullName: validated.fullName,
      phone: validated.phone,
      userType: validated.userType,
      passwordHash,
      emailVerified: false,
    }).returning();
    
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
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/api/auth/refresh",
    });
    
    // Return user (exclude sensitive fields)
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { user: userWithoutPassword, accessToken },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
