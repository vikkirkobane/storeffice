import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email
 * Body: { token: string }
 * Simulates email verification (implement real flow with Resend later).
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // In a real system, we would verify the token and set email_verified = true
    // For now, just return success (simulate)
    return NextResponse.json({ ok: true, message: "Email verified (simulated)" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
