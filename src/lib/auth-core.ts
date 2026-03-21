import { createClientSupabase } from "@/lib/supabase-server";
import { cookies } from "next/headers";

/**
 * Compatibility layer for old auth-core imports
 * Migrating to Supabase Auth - these functions wrap Supabase to maintain existing interfaces
 * 
 * IMPORTANT: The old interface used camelCase (fullName, userType, etc.)
 * The DB uses snake_case (full_name, user_type, etc.)
 * This layer converts between them for backwards compatibility.
 */

// Old interface (camelCase) - maintained for compatibility
export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;     // maps to full_name
  phone: string | null;
  avatarUrl: string | null;   // maps to avatar_url
  userType: string;           // maps to user_type
  emailVerified: boolean;     // maps to email_verified from auth.users
  isActive: boolean;          // maps to is_active
  createdAt: Date;
  updatedAt: Date;
}

// Internal DB interface (snake_case)
interface ProfileDB {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_type: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Convert DB record to old interface
function mapDBToAuthUser(db: ProfileDB & { email_verified?: boolean }): AuthUser {
  return {
    id: db.id,
    email: db.email,
    fullName: db.full_name,
    phone: db.phone,
    avatarUrl: db.avatar_url,
    userType: db.user_type,
    emailVerified: db.email_verified || false,
    isActive: db.is_active,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

/**
 * Get current user from session (server component)
 * Returns array for backwards compatibility [user] or null
 */
export async function getServerUser(): Promise<AuthUser[] | null> {
  try {
    const supabase = await createClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    const authUser = mapDBToAuthUser({
      ...profile,
      email_verified: user.email_confirmed_at !== null,
    });

    return [authUser];
  } catch (error) {
    console.error("Get server user error:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser[]> {
  try {
    const supabase = await createClientSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .limit(1);

    if (!data || data.length === 0) return [];

    const profile = data[0] as ProfileDB;
    
    // Get email verification from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const emailVerified = authUser?.user?.email_confirmed_at !== null;

    return [mapDBToAuthUser({ ...profile, email_verified: emailVerified })];
  } catch (error) {
    console.error("Get user by ID error:", error);
    return [];
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<AuthUser[]> {
  try {
    const supabase = await createClientSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (!data || data.length === 0) return [];

    const profile = data[0] as ProfileDB;
    
    // Get auth user to check email verification
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find(u => u.email === email);
    const emailVerified = authUser?.email_confirmed_at !== null;

    return [mapDBToAuthUser({ ...profile, email_verified: emailVerified })];
  } catch (error) {
    console.error("Get user by email error:", error);
    return [];
  }
}

/**
 * DEPRECATED: Use Supabase client methods directly
 */
export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
  console.warn("verifyAccessToken is deprecated - use Supabase auth instead");
  return null;
}
