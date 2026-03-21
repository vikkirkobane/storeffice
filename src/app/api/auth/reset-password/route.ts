import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 * Updates user password using Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const supabase = await createClientSupabase();

    // Verify the reset token and update password
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
      email: "", // Not needed for recovery flow if token is valid
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update the user's password (the OTP verification establishes a session)
    // Actually, verifyOtp returns a session. Then we can update the password.
    // But better way: use updateUser with the current session

    // Get the current user from the session established by verifyOtp
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Optionally: force sign out from other devices
    // await supabase.auth.admin.deleteUser(user.id); // This would delete the user - not appropriate

    return NextResponse.json({
      ok: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
