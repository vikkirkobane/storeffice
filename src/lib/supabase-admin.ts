import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin Supabase client (server-side only)
 * Uses service role key — bypasses RLS and has full admin privileges.
 * DO NOT use in client components. Only for server-side admin operations.
 */
export function createAdminSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(`Supabase admin client: SUPABASE_SERVICE_ROLE_KEY is required.`);
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
