import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Returns: { session, user profile }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClientSupabase();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    const response = NextResponse.json({
      user: {
        ...profile,
        id: data.user.id,
        email: data.user.email,
        email_verified: data.user.email_confirmed_at !== null,
        user_metadata: data.user.user_metadata,
        app_metadata: data.user.app_metadata,
      },
      session: data.session,
    });

    // Supabase SSR will handle cookies automatically if we use createClientSupabase properly
    // The cookie is set by the supabase.auth.signInWithPassword call internally

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
