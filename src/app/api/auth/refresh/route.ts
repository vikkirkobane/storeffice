import { NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";

/**
 * POST /api/auth/refresh
 * Manually refresh access token if needed
 * Note: Supabase client auto-refreshes, this endpoint is for manual refresh scenarios
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientSupabase();

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      return NextResponse.json(
        { error: "Failed to refresh session" },
        { status: 401 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
