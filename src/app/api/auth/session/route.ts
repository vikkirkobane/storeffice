import { NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase";

/**
 * GET /api/auth/session
 * Returns current user if access token cookie is valid.
 */
export async function GET() {
  try {
    const supabase = await createClientSupabase();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ user: null });
    }

    // Return data with snake_case (Supabase standard)
    // Frontend should use snake_case field names
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        ...profile,
        // Add computed field
        email_verified: user.email_confirmed_at !== null,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
