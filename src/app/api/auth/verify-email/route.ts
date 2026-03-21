import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * GET /api/auth/verify-email
 * Query params: token, type, email
 * Handles email verification from Supabase confirmation link
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const email = searchParams.get("email");

  if (!token || type !== "signup") {
    return NextResponse.redirect(
      new URL("/login?error=invalid-verification", request.url)
    );
  }

  const supabase = await createClientSupabase();

  // Verify the OTP (Supabase email confirmation flow)
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "signup",
    email: email || "",
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=verification-failed", request.url)
    );
  }

  // Successful verification - redirect to dashboard with success message
  return NextResponse.redirect(
    new URL("/dashboard?verified=true", request.url)
  );
}

/**
 * POST /api/auth/verify-email
 * Alternative: manually verify user (admin only or for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    const supabase = await createClientSupabase();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
      email,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "Email verified" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
