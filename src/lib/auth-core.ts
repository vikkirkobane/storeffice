import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET!;

if (!JWT_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// ... existing token and user functions ...

export async function getUserByEmail(email: string) {
  return await db.select().from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1).execute();
}

/**
 * Get current user from cookies (server component usage)
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
