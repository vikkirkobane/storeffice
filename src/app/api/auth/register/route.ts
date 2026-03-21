import { NextRequest, NextResponse } from "next/server";
import { createClientSupabase } from "@/lib/supabase-server";
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

    const supabase = await createClientSupabase();

    // Check if user already exists (via auth.users)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    if (existingUsers.users.some((u) => u.email === validated.email)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create auth user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
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

    // Create profile record
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
      await supabase.auth.admin.deleteUser(newUserId);
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Optionally: Send email verification via Supabase (if email confirmation required)
    // Supabase can send confirmation emails automatically based on auth settings

    // Auto-sign-in after registration (optional)
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
