import { NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase";

/**
 * POST /api/auth/logout
 * Signs out the user and clears session cookie
 */
export async function POST() {
  try {
    const supabase = await createClientSupabase();
    
    const { error } = await supabase.auth.signOut({
      // Options to ensure cookies are cleared properly
      scope: "global", // Sign out from all tabs/windows
    });

    if (error) {
      console.error("Logout error:", error);
    }

    // Clear any custom cookies if needed
    const response = NextResponse.json({ ok: true });
    
    // Explicitly delete access_token and refresh_token cookies
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    
    return response;
  } catch (error) {
    console.error("Logout exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
