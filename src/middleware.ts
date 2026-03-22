import { NextResponse } from "next/server";
import { rateLimit, getRateLimitKey, getClientIp } from "@/lib/rate-limit";
import { createClientSupabase } from "@/lib/supabase-server";

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
  "/api/health",
  // Public pages
  "/",
  "/spaces",
  "/storage",
  "/products",
  "/about",
  "/contact",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  // Public dynamic routes
  "/spaces/",
  "/storage/",
  "/products/",
  // Payment/callback pages
  "/order/success",
  "/payment/failed",
  "/booking/success",
];

/**
 * Combined middleware:
 * - Rate limiting for API routes
 * - Authentication for protected routes
 * - Email verification optional (configurable)
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

  // Skip middleware for static files and API routes
  if (path.startsWith("/api/") || path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isPublic = publicRoutes.some((route) => path.startsWith(route)) || path === "/";
  
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected route - check authentication (no email verification required)
  try {
    const supabase = await createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect_to", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }

    // User is authenticated - allow access regardless of email verification
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
