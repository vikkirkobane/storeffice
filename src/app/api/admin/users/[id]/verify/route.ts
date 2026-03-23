import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClientSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * POST /api/admin/users/:id/verify
 * Marks user's email as verified.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("userType")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "owner"].includes(profile.userType)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use admin client for admin operation
    const adminSupabase = createAdminSupabase();

    // Manually verify user's email by setting email_confirmed_at
    const { error } = await adminSupabase.auth.admin.updateUserById(targetUserId, {
      email_confirmed_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin verify user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
