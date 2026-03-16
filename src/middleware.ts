import { NextResponse } from "next/server";
import { rateLimit, getRateLimitKey, getClientIp } from "@/lib/rate-limit";

/**
 * Global rate limiting middleware for mutating API routes.
 * Skipped for static assets and GET-only endpoints by default.
 */
export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const key = getRateLimitKey(ip, "global");

  // Apply to all mutating methods on API routes
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const result = await rateLimit(key, 100, 60 * 1000); // 100 per minute per IP
    if (!result.allowed) {
      return new NextResponse("Too many requests", { status: 429 });
    }
    // Set rate limit headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Date.now() + result.resetAfter));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include all API routes except static files and health
    "/api/((?!_next/|health).*)",
  ],
};
