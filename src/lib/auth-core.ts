import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET!;

if (!JWT_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate an access JWT (short-lived, 15 minutes)
 */
export async function generateAccessToken({ userId, userType }: { userId: string; userType?: string }): Promise<string> {
  return new SignJWT({ userId, userType })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secretKey);
}

/**
 * Verify access token and return payload
 */
export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return { userId: payload.userId };
  } catch (err) {
    console.error("Invalid access token:", err);
    return null;
  }
}

/**
 * Generate a refresh token (long-lived, 30 days)
 */
export async function generateRefreshToken({ userId }: { userId: string }): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(schema.refreshTokens).values({
    userId,
    token,
    expiresAt,
    revoked: false,
    createdAt: new Date(),
  });

  return token;
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const result = await db.select().from(schema.refreshTokens).where(eq(schema.refreshTokens.token, token)).limit(1).execute();
  if (!result.length) return null;

  const rt = result[0];
  if (rt.revoked || rt.expiresAt < new Date()) return null;

  return { userId: rt.userId };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const result = await db.select().from(schema.profiles).where(eq(schema.profiles.id, userId)).limit(1).execute();
    return result;
  } catch (error) {
    console.error("Get user by ID error:", error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await db.select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1).execute();
}

/**
 * Create a new user (registration)
 */
export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  userType?: string;
}) {
  const hashed = await hashPassword(data.password);
  const id = crypto.randomUUID();

  const [user] = await db.insert(schema.profiles).values({
    id,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone || null,
    userType: data.userType || "customer",
    emailVerified: false,
    isActive: true,
    passwordHash: hashed,
  }).returning();

  return user;
}

/**
 * Get current user from cookies (server component)
 */
export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.userId);
  return user[0] || null;
}
