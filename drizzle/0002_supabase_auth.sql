-- Remove password hash and email verification fields from profiles (Supabase Auth manages these)
-- Convert profiles.id to reference auth.users(id) with cascade delete

-- First, drop dependent foreign keys if any
ALTER TABLE IF EXISTS "office_spaces" DROP CONSTRAINT IF EXISTS "office_spaces_owner_id_profiles_id_fk";
ALTER TABLE IF EXISTS "storage_spaces" DROP CONSTRAINT IF EXISTS "storage_spaces_owner_id_profiles_id_fk";
ALTER TABLE IF EXISTS "products" DROP CONSTRAINT IF EXISTS "products_merchant_id_profiles_id_fk";
ALTER TABLE IF EXISTS "bookings" DROP CONSTRAINT IF EXISTS "bookings_customer_id_profiles_id_fk";
ALTER TABLE IF EXISTS "storage_rentals" DROP CONSTRAINT IF EXISTS "storage_rentals_merchant_id_profiles_id_fk";
ALTER TABLE IF EXISTS "orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_profiles_id_fk";
ALTER TABLE IF EXISTS "payments" DROP CONSTRAINT IF EXISTS "payments_user_id_profiles_id_fk";
ALTER TABLE IF EXISTS "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_user_id_profiles_id_fk";
ALTER TABLE IF EXISTS "notifications" DROP CONSTRAINT IF EXISTS "notifications_user_id_profiles_id_fk";
ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_sender_id_profiles_id_fk";
ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_receiver_id_profiles_id_fk";

-- Drop columns that are no longer needed
ALTER TABLE "profiles" 
  DROP COLUMN IF EXISTS "password_hash",
  DROP COLUMN IF EXISTS "email_verified",
  DROP COLUMN IF EXISTS "verification_token",
  DROP COLUMN IF EXISTS "verification_expires";

-- Note: profiles.id remains as uuid primary key.
-- We'll add a foreign key constraint to auth.users after ensuring data consistency.
-- In Supabase, auth.users.id is uuid, so this is compatible.

-- Add foreign key to auth.users (ON DELETE CASCADE to clean up profiles when auth user is deleted)
ALTER TABLE "profiles" 
  ADD CONSTRAINT "profiles_id_auth_users_id_fk" 
  FOREIGN KEY ("id") 
  REFERENCES "auth"."users"("id") 
  ON DELETE CASCADE 
  ON UPDATE NO ACTION;

-- Re-add all the foreign keys that reference profiles.id
ALTER TABLE "office_spaces" 
  ADD CONSTRAINT "office_spaces_owner_id_profiles_id_fk" 
  FOREIGN KEY ("owner_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "storage_spaces" 
  ADD CONSTRAINT "storage_spaces_owner_id_profiles_id_fk" 
  FOREIGN KEY ("owner_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "products" 
  ADD CONSTRAINT "products_merchant_id_profiles_id_fk" 
  FOREIGN KEY ("merchant_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "bookings" 
  ADD CONSTRAINT "bookings_customer_id_profiles_id_fk" 
  FOREIGN KEY ("customer_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "storage_rentals" 
  ADD CONSTRAINT "storage_rentals_merchant_id_profiles_id_fk" 
  FOREIGN KEY ("merchant_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "orders" 
  ADD CONSTRAINT "orders_customer_id_profiles_id_fk" 
  FOREIGN KEY ("customer_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "payments" 
  ADD CONSTRAINT "payments_user_id_profiles_id_fk" 
  FOREIGN KEY ("user_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "cart_items" 
  ADD CONSTRAINT "cart_items_user_id_profiles_id_fk" 
  FOREIGN KEY ("user_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "notifications" 
  ADD CONSTRAINT "notifications_user_id_profiles_id_fk" 
  FOREIGN KEY ("user_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "messages" 
  ADD CONSTRAINT "messages_sender_id_profiles_id_fk" 
  FOREIGN KEY ("sender_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION,
  ADD CONSTRAINT "messages_receiver_id_profiles_id_fk" 
  FOREIGN KEY ("receiver_id") 
  REFERENCES "profiles"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

-- Recreate indexes if they were dropped
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "profiles" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_profiles_user_type" ON "profiles" USING btree ("user_type");
