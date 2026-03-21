-- Migration: Add is_active column to profiles and clean up
-- This aligns the profiles table with Supabase Auth integration

-- 1. Add is_active column if it doesn't exist (for account suspension)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- 2. Create index on is_active for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 3. Ensure all existing rows have is_active = true
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;

-- 4. Drop any better-auth tables if they were accidentally created in public schema
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.verifications CASCADE;

-- Note: The profiles table already has the correct foreign key to auth.users(id)
-- from the original schema export. Do NOT drop/recreate constraints.
