-- Storeffice: Supabase Auth Integration & Schema Updates
-- This migration aligns the database with Supabase Auth and removes custom auth artifacts
-- Run this ONCE in your Supabase project (SQL Editor)
-- Safe to run multiple times - all operations are idempotent

BEGIN;

-- ============================================
-- 1. Add is_active column to profiles (if missing)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active boolean DEFAULT true;
    RAISE NOTICE 'Added is_active column to profiles';
  END IF;
END $$;

-- Set existing rows to active if null
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- ============================================
-- 2. Remove deprecated custom auth columns
-- ============================================
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS password_hash,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS verification_token,
  DROP COLUMN IF EXISTS verification_expires;

-- ============================================
-- 3. Drop any better-auth tables in public schema
-- (These should not exist; better-auth uses auth schema)
-- ============================================
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.verifications CASCADE;

-- ============================================
-- 4. Ensure profiles.id references auth.users(id)
-- ============================================
DO $$
BEGIN
  -- Check if the foreign key already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public' 
      AND tc.table_name = 'profiles'
      AND kcu.column_name = 'id'
      AND tc.constraint_name = 'profiles_id_auth_users_id_fk'
  ) THEN
    -- Add the foreign key
    ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_id_auth_users_id_fk 
      FOREIGN KEY (id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION;
    RAISE NOTICE 'Added foreign key: profiles.id -> auth.users.id';
  END IF;
END $$;

-- ============================================
-- 5. Re-add all foreign keys to profiles (with correct names)
-- ============================================
DO $$
DECLARE
  target_schema text := 'public';
  tbl text;
  constraint_name text;
  local_col text;
  exists_bool boolean;
BEGIN
  -- List of (table, constraint_name, local_column) to ensure exist
  FOR tbl, constraint_name, local_col IN SELECT * FROM (VALUES
    ('office_spaces','office_spaces_owner_id_profiles_id_fk','owner_id'),
    ('storage_spaces','storage_spaces_owner_id_profiles_id_fk','owner_id'),
    ('products','products_merchant_id_profiles_id_fk','merchant_id'),
    ('bookings','bookings_customer_id_profiles_id_fk','customer_id'),
    ('storage_rentals','storage_rentals_merchant_id_profiles_id_fk','merchant_id'),
    ('orders','orders_customer_id_profiles_id_fk','customer_id'),
    ('payments','payments_user_id_profiles_id_fk','user_id'),
    ('cart_items','cart_items_user_id_profiles_id_fk','user_id'),
    ('notifications','notifications_user_id_profiles_id_fk','user_id'),
    ('messages','messages_sender_id_profiles_id_fk','sender_id'),
    ('messages','messages_receiver_id_profiles_id_fk','receiver_id')
  ) AS t(tbl, constraint_name, local_col) LOOP
    
    -- Check if referencing table exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = target_schema 
      AND table_name = tbl
    ) INTO exists_bool;
    
    IF exists_bool THEN
      -- For messages, check each constraint separately
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = constraint_name 
        AND table_schema = target_schema
      ) THEN
        EXECUTE format(
          'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
          target_schema, tbl, constraint_name, local_col
        );
        RAISE NOTICE 'Added constraint: % on table %', constraint_name, tbl;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 6. Recreate indexes on profiles
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles USING btree (user_type);
    RAISE NOTICE 'Ensured indexes on profiles table';
  END IF;
END $$;

-- ============================================
-- 7. Verify foreign key from profiles to auth.users
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_auth_users_id_fk'
    AND table_schema = 'public'
  ) THEN
    RAISE WARNING 'Foreign key profiles_id_auth_users_id_fk NOT found! Profiles should reference auth.users(id)';
  ELSE
    RAISE NOTICE 'Foreign key profiles_id_auth_users_id_fk is properly configured';
  END IF;
END $$;

COMMIT;

RAISE NOTICE '✅ Migration complete: Supabase Auth integration ready';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '  1. Disable email confirmation in Supabase Dashboard (if desired)';
RAISE NOTICE '  2. Test registration and login flows';
