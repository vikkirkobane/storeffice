import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { insertProfileSchema } from "@/lib/db/schema";
import { z } from "zod";

const registerSchema = insertProfileSchema.extend({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  userType: z.enum(["customer", "owner", "merchant"]).default("customer"),
  phone: z.string().optional(),
});

/**
 * POST /api/auth/register
 * Body: { email, password, fullName, phone?, userType? }
 * Returns: { session, user profile }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Use admin client for user management
    const supabaseAdmin = createAdminSupabase();

    // Check if user already exists (via auth.users)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUsers.users.some((u) => u.email === validated.email)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create auth user with Supabase Auth using admin client
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: false, // require verification
      user_metadata: {
        full_name: validated.fullName,
        phone: validated.phone,
        user_type: validated.userType,
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    const newUserId = authData.user.id;

    // Use regular client (with cookies) for inserting profile, respecting RLS if needed
    // Since this is server-side, we can use anon key; but we are inserting into profiles table
    // We'll use the regular supabase client; it should work because we are inserting the user's own profile
    const supabase = await createClientSupabase();

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: newUserId,
        email: validated.email,
        full_name: validated.fullName,
        phone: validated.phone || null,
        user_type: validated.userType,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Auto-sign-in after registration using admin client? Or regular?
    // We should sign in with the regular client so session is cookie-based
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    // Get the profile we just created to return full data
    const { data: newProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", newUserId)
      .single();

    return NextResponse.json({
      user: {
        ...newProfile,
        id: authData.user.id,
        email: authData.user.email,
        email_verified: authData.user.email_confirmed_at !== null,
        user_metadata: authData.user.user_metadata,
      },
      session: sessionData.session,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
