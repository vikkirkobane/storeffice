import { createClientSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_type: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get the current user from the session (server component)
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile as UserProfile;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect_to=" + encodeURIComponent("/dashboard"));
  }

  return user;
}

/**
 * Require specific user roles
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const supabase = await createClientSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.user_type)) {
    redirect("/unauthorized");
  }

  return profile;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }
) {
  const supabase = await createClientSupabase();

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const supabase = await createClientSupabase();

  // First verify current password by attempting to reauthenticate
  const { error: reauthError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (reauthError) {
    throw new Error("Failed to update password. Please check your current password.");
  }
}

/**
 * Update user email (requires re-authentication)
 */
export async function updateEmail(newEmail: string) {
  const supabase = await createClientSupabase();

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw error;
}

/**
 * Delete user account (soft delete)
 */
export async function deleteAccount(userId: string) {
  const supabase = await createClientSupabase();

  // Soft delete: mark profile as inactive
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);

  // Optionally also delete auth user (irreversible)
  // const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (profileError) throw profileError;
}
