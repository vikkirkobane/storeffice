import { NextResponse } from "next/server";
import { rateLimit, getRateLimitKey, getClientIp } from "@/lib/rate-limit";
import { createClientSupabase } from "@/lib/supabase";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/health", // health check endpoint
];

// Routes that require email verification (after user verifies email)
const verificationRequiredRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
];

/**
 * Combined middleware:
 * - Rate limiting for API routes
 * - Authentication for protected routes
 * - Email verification enforcement
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limiting for mutating API routes
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method) && path.startsWith("/api/")) {
    const ip = getClientIp(request);
    const key = getRateLimitKey(ip, "global");
    const result = await rateLimit(key, 100, 60 * 1000);
    if (!result.allowed) {
      return new NextResponse("Too many requests", { status: 429 });
    }
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Date.now() + result.resetAfter));
    return response;
  }

  // Skip middleware for static files and API routes (except auth session check if needed)
  if (path.startsWith("/api/") || path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isPublic = publicRoutes.some((route) => path.startsWith(route)) || path === "/";
  
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected route - check authentication
  try {
    const supabase = await createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect_to", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }

    // Check email verification for sensitive routes
    const requiresVerification = verificationRequiredRoutes.some((route) => path.startsWith(route));
    if (requiresVerification) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_verified")
        .eq("id", user.id)
        .single();

      // Note: Supabase Auth email confirmation is checked via email_confirmed_at on user object
      // But we also have custom flag in profiles, can use either
      const isEmailConfirmed = user.email_confirmed_at !== null;
      
      if (!isEmailConfirmed) {
        // Redirect to email verification prompt or resend verification
        const url = new URL("/dashboard?verify_email=true", request.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next(); // Allow on error to avoid locking users out
  }
}

export const config = {
  matcher: [
    // Match all pages except static files, API routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
