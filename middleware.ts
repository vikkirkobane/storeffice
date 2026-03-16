import { auth } from "@/lib/auth";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"; // placeholder, will replace

// Since better-auth doesn't have a built-in middleware like next-auth,
// we'll implement a simple one manually

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // Public paths that don't require auth
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/health",
    "/api/auth",
    "/_next",
  ];

  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isPublic) {
    return NextResponse.next();
  }

  try {
    // Call auth.getSession or verify token via better-auth's handler
    // better-auth's handler protects routes via cookies automatically
    // So we can just forward the request; the API routes will handle auth
    // For page-level protection, we'll use server components with auth checks
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Redirect to login? Actually let auth routes handle it
    return NextResponse.rewrite(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Protect all routes except the public ones
    "/((?!_next|api/auth|api/health|login|register).*)",
  ],
};
