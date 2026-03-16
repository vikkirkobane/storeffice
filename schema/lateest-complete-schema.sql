-- schema.sql
-- Export for project: ltesuparwlhhohevknpz
-- Generated: (review before executing)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- Schema: auth
-- ========================
CREATE SCHEMA IF NOT EXISTS auth;

-- users
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id uuid,
  id uuid PRIMARY KEY,
  aud varchar,
  role varchar,
  email varchar,
  encrypted_password varchar,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token varchar,
  confirmation_sent_at timestamptz,
  recovery_token varchar,
  recovery_sent_at timestamptz,
  email_change_token_new varchar,
  email_change varchar,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone text UNIQUE,
  phone_confirmed_at timestamptz,
  phone_change text DEFAULT ''::varchar,
  phone_change_token varchar DEFAULT ''::varchar,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current varchar DEFAULT ''::varchar,
  email_change_confirm_status smallint DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2),
  banned_until timestamptz,
  reauthentication_token varchar DEFAULT ''::varchar,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz,
  is_anonymous boolean DEFAULT false
);

-- refresh_tokens
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  instance_id uuid,
  id bigint PRIMARY KEY DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass),
  token varchar UNIQUE,
  user_id varchar,
  revoked boolean,
  created_at timestamptz,
  updated_at timestamptz,
  parent varchar,
  session_id uuid
);

-- identities
CREATE TABLE IF NOT EXISTS auth.identities (
  provider_id text,
  user_id uuid,
  identity_data jsonb,
  provider text,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'))) STORED,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

-- sessions (simplified)
-- Note: auth.aal_level enum must exist in auth schema
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  factor_id uuid,
  aal text,
  not_after timestamptz,
  refreshed_at timestamp,
  user_agent text,
  ip inet,
  tag text,
  oauth_client_id uuid,
  refresh_token_hmac_key text,
  refresh_token_counter bigint
);

-- (Other auth tables from Supabase not fully enumerated here — keep original Supabase objects)

-- Recommended RLS for auth.users (example)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "auth.users: self_select" ON auth.users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);
CREATE POLICY IF NOT EXISTS "auth.users: self_update" ON auth.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ========================
-- Schema: storage
-- ========================
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TYPE IF NOT EXISTS storage.buckettype AS ENUM ('STANDARD','ANALYTICS');

CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[],
  owner_id text,
  type storage.buckettype DEFAULT 'STANDARD'
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
  version text,
  owner_id text,
  user_metadata jsonb,
  level integer
);

CREATE TABLE IF NOT EXISTS storage.prefixes (
  bucket_id text,
  name text,
  level integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (bucket_id, name, level)
);

-- Note: storage.get_level referenced by previous introspection may be a function. Confirm presence.

-- RLS examples for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "storage.objects: user_uploads_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY IF NOT EXISTS "storage.objects: user_uploads_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ========================
-- Schema: vault
-- ========================
CREATE SCHEMA IF NOT EXISTS vault;

CREATE TABLE IF NOT EXISTS vault.secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text DEFAULT ''::text,
  secret text,
  key_id uuid,
  nonce bytea DEFAULT vault._crypto_aead_det_noncegen(),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- Schema: realtime
-- ========================
CREATE SCHEMA IF NOT EXISTS realtime;

CREATE TABLE IF NOT EXISTS realtime.messages (
  topic text,
  extension text,
  payload jsonb,
  event text,
  private boolean DEFAULT false,
  updated_at timestamp DEFAULT now(),
  inserted_at timestamp DEFAULT now(),
  id uuid DEFAULT gen_random_uuid(),
  PRIMARY KEY (inserted_at, id)
);

CREATE TABLE IF NOT EXISTS realtime.subscription (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscription_id uuid,
  entity regclass,
  filters text[], -- simplified representation; actual type may be user_defined_filter[]
  claims jsonb,
  claims_role text,
  created_at timestamp DEFAULT timezone('utc', now())
);

-- RLS for realtime.messages (example)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
-- room-based policies expect a public.room_members table; ensure it exists if you use these policies
CREATE POLICY IF NOT EXISTS "realtime.messages: room_members_can_read" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    topic LIKE 'room:%' AND EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.user_id = (SELECT auth.uid())::uuid AND rm.room_id = split_part(topic, ':', 2)::uuid
    )
  );
CREATE POLICY IF NOT EXISTS "realtime.messages: room_members_can_write" ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    topic LIKE 'room:%' AND EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.user_id = (SELECT auth.uid())::uuid AND rm.room_id = split_part(topic, ':', 2)::uuid
    )
  );

-- ========================
-- Schema: public (application)
-- ========================
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  phone text,
  profile_photo text,
  roles text[] DEFAULT ARRAY['customer'::text],
  device_tokens text[],
  preferences jsonb DEFAULT '{}'::jsonb,
  last_seen timestamptz,
  app_version text,
  platform text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "profiles: self_select" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);
CREATE POLICY IF NOT EXISTS "profiles: self_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY IF NOT EXISTS "profiles: self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- office_spaces
CREATE TABLE IF NOT EXISTS public.office_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  title text,
  description text,
  location jsonb,
  photos text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  capacity int DEFAULT 1,
  pricing jsonb,
  availability jsonb[] DEFAULT '{}',
  thumbnail_photo text,
  search_keywords text[],
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  view_count int DEFAULT 0,
  favorite_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status = ANY (ARRAY['pending','verified','rejected'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- storage_spaces
CREATE TABLE IF NOT EXISTS public.storage_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  title text,
  description text,
  location jsonb,
  photos text[] DEFAULT '{}',
  storage_type text CHECK (storage_type = ANY (ARRAY['shelf','room','warehouse'])),
  dimensions jsonb,
  features text[],
  pricing jsonb,
  thumbnail_photo text,
  search_keywords text[],
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  view_count int DEFAULT 0,
  favorite_count int DEFAULT 0,
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status = ANY (ARRAY['pending','verified','rejected'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid,
  storage_id uuid,
  title text,
  description text,
  category text,
  subcategory text,
  price numeric,
  images text[] DEFAULT '{}',
  inventory int DEFAULT 0,
  sku text,
  thumbnail_image text,
  search_keywords text[],
  tags text[],
  weight numeric,
  dimensions jsonb,
  shipping_info jsonb,
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  view_count int DEFAULT 0,
  favorite_count int DEFAULT 0,
  sales_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status = ANY (ARRAY['pending','verified','rejected'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  space_id uuid,
  start_date timestamptz,
  end_date timestamptz,
  total_price numeric,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','confirmed','cancelled','completed','no_show'])),
  payment_id uuid,
  check_in_time timestamptz,
  check_out_time timestamptz,
  qr_code text,
  special_requests text,
  cancellation_policy jsonb,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- storage_rentals
CREATE TABLE IF NOT EXISTS public.storage_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid,
  storage_id uuid,
  start_date date,
  end_date date,
  monthly_price numeric,
  status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active','expired','terminated'])),
  payment_schedule text DEFAULT 'monthly' CHECK (payment_schedule = ANY (ARRAY['monthly','quarterly','annual'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  items jsonb,
  subtotal numeric,
  tax_amount numeric DEFAULT 0,
  shipping_amount numeric DEFAULT 0,
  total_amount numeric,
  shipping_address jsonb,
  billing_address jsonb,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','confirmed','processing','shipped','delivered','cancelled','refunded'])),
  tracking_number text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  delivery_instructions text,
  payment_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "orders: owner_select" ON public.orders
  FOR SELECT TO authenticated
  USING (customer_id = (SELECT auth.uid())::uuid);
CREATE POLICY IF NOT EXISTS "orders: owner_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = (SELECT auth.uid())::uuid);
CREATE POLICY IF NOT EXISTS "orders: owner_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (customer_id = (SELECT auth.uid())::uuid)
  WITH CHECK (customer_id = (SELECT auth.uid())::uuid);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  target_id uuid,
  target_type text CHECK (target_type = ANY (ARRAY['office','product','storage'])),
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  photos text[] DEFAULT '{}',
  response text,
  response_date timestamptz,
  is_verified boolean DEFAULT false,
  helpful_count int DEFAULT 0,
  reported_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- conversations & messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants uuid[],
  related_listing_id uuid,
  related_listing_type text CHECK (related_listing_type = ANY (ARRAY['office','storage','product'])),
  title text,
  last_message_id uuid,
  last_message_preview text,
  last_message_at timestamptz DEFAULT now(),
  is_group boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  sender_id uuid,
  content text,
  message_type text DEFAULT 'text' CHECK (message_type = ANY (ARRAY['text','image','file','location','booking','payment'])),
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  is_deleted boolean DEFAULT false,
  reply_to_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "messages: participant_select" ON public.messages
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid())::uuid = ANY (
    SELECT unnest( (SELECT participants FROM public.conversations WHERE id = public.messages.conversation_id) )
  ));
CREATE POLICY IF NOT EXISTS "messages: participant_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid())::uuid
    AND ((SELECT auth.uid())::uuid = ANY (
      SELECT unnest( (SELECT participants FROM public.conversations WHERE id = public.messages.conversation_id) )
    ))
  );

-- payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  amount numeric,
  currency text DEFAULT 'USD',
  payment_method text,
  payment_gateway text,
  transaction_id text UNIQUE,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','processing','completed','failed','refunded','cancelled'])),
  metadata jsonb DEFAULT '{}'::jsonb,
  payment_source text,
  failure_reason text,
  refund_amount numeric,
  refund_reason text,
  refunded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text CHECK (type = ANY (ARRAY['booking','order','payment','message','review','promotion','system'])),
  title text,
  body text,
  data jsonb DEFAULT '{}'::jsonb,
  click_action text,
  image_url text,
  sound text DEFAULT 'default',
  badge_count int,
  is_read boolean DEFAULT false,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  target_id uuid,
  target_type text CHECK (target_type = ANY (ARRAY['office','product','storage'])),
  created_at timestamptz DEFAULT now()
);

-- user_carts
CREATE TABLE IF NOT EXISTS public.user_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  quantity int DEFAULT 1 CHECK (quantity > 0),
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text,
  event_data jsonb DEFAULT '{}'::jsonb,
  platform text,
  app_version text,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- app_feedback
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  type text CHECK (type = ANY (ARRAY['bug','feature_request','general'])),
  rating int CHECK (rating >=1 AND rating <=5),
  title text,
  description text,
  platform text,
  app_version text,
  device_info jsonb,
  status text DEFAULT 'open' CHECK (status = ANY (ARRAY['open','in_progress','resolved','closed'])),
  created_at timestamptz DEFAULT now()
);

-- otp_codes
CREATE TABLE IF NOT EXISTS public.otp_codes (
  email text,
  otp text,
  purpose text DEFAULT 'login',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (email, purpose)
);

-- auth_otps
CREATE TABLE IF NOT EXISTS public.auth_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  otp_hash text,
  purpose text,
  expires_at timestamptz,
  attempts int DEFAULT 0,
  consumed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ========================
-- Indexes (recommendations)
-- ========================
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_public_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_public_products_merchant_id ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_public_office_spaces_owner_id ON public.office_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);

-- ========================
-- Broadcast trigger example
-- ========================
CREATE OR REPLACE FUNCTION public.row_broadcast_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'room:' || COALESCE(NEW.room_id, OLD.room_id)::text,
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example trigger creation (commented out — enable if desired and ensure room_id column exists)
-- CREATE TRIGGER messages_broadcast_trigger
--   AFTER INSERT OR UPDATE OR DELETE ON public.messages
--   FOR EACH ROW EXECUTE FUNCTION public.row_broadcast_trigger();

-- ========================
-- SECURITY DEFINER helper example
-- ========================
/*
CREATE OR REPLACE FUNCTION public.get_user_tenant() RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$
  SELECT tenant_id FROM public.user_profiles WHERE auth_user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant() FROM anon, authenticated;
*/

-- ========================
-- Final notes
-- ========================
-- 1) Review enum/user-defined types that exist in the auth schema (aal_level, factor_type, etc.)
-- 2) Confirm presence of Supabase internal functions: storage.get_level, storage.foldername, vault._crypto_aead_det_noncegen, realtime.broadcast_changes.
-- 3) Test in staging. Backup production.
-- 4) Remove or adjust policy statements if you have custom auth claims (tenant_id, user_role).

-- End of schema.sql