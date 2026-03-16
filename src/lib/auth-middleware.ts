import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  userType: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  user: AuthUser | null;
  token: string | null;
}

/**
 * Middleware to authenticate API routes
 * Use in API route handlers via withAuth()
 */
export async function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const cookieStore = await req.cookies;
    const cookieToken = cookieStore.get("access_token")?.value;
    const accessToken = token || cookieToken;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    const user = await getUserById(payload.userId);
    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }
    
    const authUser = user[0] as AuthUser;
    
    // Check if account is active
    if (!authUser.isActive) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 }
      );
    }
    
    // Check role authorization if specified
    if (allowedRoles && !allowedRoles.includes(authUser.userType)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const context: AuthContext = {
      user: authUser,
      token: accessToken,
    };
    
    return handler(req, context);
  });
}

/**
 * Utility to get user from token (for server components)
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
