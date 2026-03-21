import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 * Sends password reset email via Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClientSupabase();

    // Check if user exists (optional: always return success to avoid email enumeration)
    const { data: user } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    // Even if user doesn't exist, we'll proceed with reset request
    // to prevent email enumeration attacks
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Always return success (even if email not found, Supabase will still respond success)
    return NextResponse.json({
      ok: true,
      message: "Password reset email sent if account exists",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
