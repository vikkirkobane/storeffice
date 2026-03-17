-- NOTE: This file is a generated schema export for your Supabase project (`rwoahxtcsaefxbzcluek`).
-- It includes: extensions, types/enums, tables (with columns and defaults), primary keys, foreign keys,
-- and Row-Level Security (RLS) policies found in the `public`, `auth`, `storage`, and `realtime` schemas.
-- Review before applying. Some helper objects (indexes, triggers, functions) provided by Supabase platform
-- may be omitted if not present in the source listing.

-- ======================================
-- Extensions
-- ======================================

-- The following extensions are referenced by the project. Create them first (some require superuser).
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- (Other extensions present in the source: intarray, pg_net, pg_graphql, autoinc, pgrouting, hypopg, hstore,
-- pg_trgm, tsm_system_time, pgroonga, btree_gin, pg_walinspect, file_fdw, rum, pg_cron, refint, xml2, pg_hashids,
-- vector, http, pgstattuple, bloom, pgtap, btree_gist, lo, ltree, postgres_fdw, dict_xsyn, pg_tle, ...)
-- Install additional extensions as needed in your environment.

-- ======================================
-- Schema: auth
-- ======================================

-- Table: auth.users
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
  phone text DEFAULT NULL::character varying UNIQUE,
  phone_confirmed_at timestamptz,
  phone_change text DEFAULT ''::character varying,
  phone_change_token varchar DEFAULT ''::character varying,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current varchar DEFAULT ''::character varying,
  email_change_confirm_status smallint DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2),
  banned_until timestamptz,
  reauthentication_token varchar DEFAULT ''::character varying,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamptz,
  is_anonymous boolean DEFAULT false
);

-- Table: auth.refresh_tokens
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

-- Table: auth.instances
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid PRIMARY KEY,
  uuid uuid,
  raw_base_config text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: auth.audit_log_entries
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  instance_id uuid,
  id uuid PRIMARY KEY,
  payload json,
  created_at timestamptz,
  ip_address varchar DEFAULT ''::character varying
);

-- Table: auth.schema_migrations
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version varchar PRIMARY KEY
);

-- Table: auth.identities
CREATE TABLE IF NOT EXISTS auth.identities (
  provider_id text,
  user_id uuid,
  identity_data jsonb,
  provider text,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Table: auth.sessions
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  factor_id uuid,
  aal auth.aal_level, -- USER-DEFINED enum in source
  not_after timestamptz,
  refreshed_at timestamp,
  user_agent text,
  ip inet,
  tag text,
  oauth_client_id uuid,
  refresh_token_hmac_key text,
  refresh_token_counter bigint,
  scopes text CHECK (char_length(scopes) <= 4096)
);

-- Table: auth.mfa_factors
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id uuid PRIMARY KEY,
  user_id uuid,
  friendly_name text,
  factor_type auth.factor_type, -- enum: totp, webauthn, phone
  status auth.factor_status,     -- enum: unverified, verified
  created_at timestamptz,
  updated_at timestamptz,
  secret text,
  phone text,
  last_challenged_at timestamptz UNIQUE,
  web_authn_credential jsonb,
  web_authn_aaguid uuid,
  last_webauthn_challenge_data jsonb
);

-- Table: auth.mfa_challenges
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  id uuid PRIMARY KEY,
  factor_id uuid,
  created_at timestamptz,
  verified_at timestamptz,
  ip_address inet,
  otp_code text,
  web_authn_session_data jsonb
);

-- Table: auth.mfa_amr_claims
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  session_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  authentication_method text,
  id uuid PRIMARY KEY
);

-- Table: auth.sso_providers
CREATE TABLE IF NOT EXISTS auth.sso_providers (
  id uuid PRIMARY KEY,
  resource_id text,
  created_at timestamptz,
  updated_at timestamptz,
  disabled boolean
);

-- Table: auth.sso_domains
CREATE TABLE IF NOT EXISTS auth.sso_domains (
  id uuid PRIMARY KEY,
  sso_provider_id uuid,
  domain text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Table: auth.saml_providers
CREATE TABLE IF NOT EXISTS auth.saml_providers (
  id uuid PRIMARY KEY,
  sso_provider_id uuid,
  entity_id text UNIQUE,
  metadata_xml text,
  metadata_url text,
  attribute_mapping jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  name_id_format text
);

-- Table: auth.saml_relay_states
CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
  id uuid PRIMARY KEY,
  sso_provider_id uuid,
  request_id text,
  for_email text,
  redirect_to text,
  created_at timestamptz,
  updated_at timestamptz,
  flow_state_id uuid
);

-- Table: auth.flow_state
CREATE TABLE IF NOT EXISTS auth.flow_state (
  id uuid PRIMARY KEY,
  user_id uuid,
  auth_code text,
  code_challenge_method auth.code_challenge_method, -- enum: s256, plain
  code_challenge text,
  provider_type text,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamptz,
  updated_at timestamptz,
  authentication_method text,
  auth_code_issued_at timestamptz,
  invite_token text,
  referrer text,
  oauth_client_state_id uuid,
  linking_target_id uuid,
  email_optional boolean DEFAULT false
);

-- Table: auth.one_time_tokens
CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
  id uuid PRIMARY KEY,
  user_id uuid,
  token_type auth.one_time_token_type, -- enum with multiple values
  token_hash text CHECK (char_length(token_hash) > 0),
  relates_to text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Table: auth.oauth_clients
CREATE TABLE IF NOT EXISTS auth.oauth_clients (
  id uuid PRIMARY KEY,
  client_secret_hash text,
  registration_type auth.oauth_registration_type,
  redirect_uris text,
  grant_types text,
  client_name text CHECK (char_length(client_name) <= 1024),
  client_uri text CHECK (char_length(client_uri) <= 2048),
  logo_uri text CHECK (char_length(logo_uri) <= 2048),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type,
  token_endpoint_auth_method text CHECK (token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text]))
);

-- Table: auth.oauth_authorizations
CREATE TABLE IF NOT EXISTS auth.oauth_authorizations (
  id uuid PRIMARY KEY,
  authorization_id text UNIQUE,
  client_id uuid,
  user_id uuid,
  redirect_uri text CHECK (char_length(redirect_uri) <= 2048),
  scope text CHECK (char_length(scope) <= 4096),
  state text CHECK (char_length(state) <= 4096),
  resource text CHECK (char_length(resource) <= 2048),
  code_challenge text CHECK (char_length(code_challenge) <= 128),
  code_challenge_method auth.code_challenge_method,
  response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type,
  status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status,
  authorization_code text UNIQUE CHECK (char_length(authorization_code) <= 255),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + '00:03:00'::interval),
  approved_at timestamptz,
  nonce text CHECK (char_length(nonce) <= 255)
);

-- Table: auth.oauth_consents
CREATE TABLE IF NOT EXISTS auth.oauth_consents (
  id uuid PRIMARY KEY,
  user_id uuid,
  client_id uuid,
  scopes text CHECK (char_length(scopes) <= 2048),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Table: auth.oauth_client_states
CREATE TABLE IF NOT EXISTS auth.oauth_client_states (
  id uuid PRIMARY KEY,
  provider_type text,
  code_verifier text,
  created_at timestamptz
);

-- Table: auth.custom_oauth_providers
CREATE TABLE IF NOT EXISTS auth.custom_oauth_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type text CHECK (provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text])),
  identifier text UNIQUE CHECK (identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text),
  name text CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  client_id text CHECK (char_length(client_id) >= 1 AND char_length(client_id) <= 512),
  client_secret text,
  acceptable_client_ids text[] DEFAULT '{}'::text[],
  scopes text[] DEFAULT '{}'::text[],
  pkce_enabled boolean DEFAULT true,
  attribute_mapping jsonb DEFAULT '{}'::jsonb,
  authorization_params jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  email_optional boolean DEFAULT false,
  issuer text,
  discovery_url text,
  skip_nonce_check boolean DEFAULT false,
  cached_discovery jsonb,
  discovery_cached_at timestamptz,
  authorization_url text,
  token_url text,
  userinfo_url text,
  jwks_uri text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ======================================
-- Schema: storage
-- ======================================

-- Table: storage.buckets
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
  type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype
);

-- Table: storage.objects
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
  user_metadata jsonb
);

-- Table: storage.migrations
CREATE TABLE IF NOT EXISTS storage.migrations (
  id integer PRIMARY KEY,
  name varchar UNIQUE,
  hash varchar,
  executed_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table: storage.s3_multipart_uploads
CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads (
  id text PRIMARY KEY,
  in_progress_size bigint DEFAULT 0,
  upload_signature text,
  bucket_id text,
  key text,
  version text,
  owner_id text,
  created_at timestamptz DEFAULT now(),
  user_metadata jsonb
);

-- Table: storage.s3_multipart_uploads_parts
CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id text,
  size bigint DEFAULT 0,
  part_number integer,
  bucket_id text,
  key text,
  etag text,
  owner_id text,
  version text,
  created_at timestamptz DEFAULT now()
);

-- Table: storage.buckets_analytics
CREATE TABLE IF NOT EXISTS storage.buckets_analytics (
  name text,
  type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype,
  format text DEFAULT 'ICEBERG'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_at timestamptz
);

-- Table: storage.buckets_vectors
CREATE TABLE IF NOT EXISTS storage.buckets_vectors (
  id text PRIMARY KEY,
  type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: storage.vector_indexes
CREATE TABLE IF NOT EXISTS storage.vector_indexes (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  bucket_id text,
  data_type text,
  dimension integer,
  distance_metric text,
  metadata_configuration jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ======================================
-- Schema: realtime
-- ======================================

-- Table: realtime.schema_migrations
CREATE TABLE IF NOT EXISTS realtime.schema_migrations (
  version bigint PRIMARY KEY,
  inserted_at timestamp
);

-- Table: realtime.subscription
CREATE TABLE IF NOT EXISTS realtime.subscription (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subscription_id uuid,
  entity regclass,
  filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[],
  claims jsonb,
  claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED,
  created_at timestamp DEFAULT timezone('utc'::text, now())
);

-- Table: realtime.messages
CREATE TABLE IF NOT EXISTS realtime.messages (
  topic text,
  extension text,
  payload jsonb,
  event text,
  private boolean DEFAULT false,
  updated_at timestamp DEFAULT now(),
  inserted_at timestamp DEFAULT now(),
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- ======================================
-- Schema: public
-- ======================================

-- Table: public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email citext UNIQUE,
  full_name text,
  phone text,
  avatar_url text,
  user_type text DEFAULT 'customer'::text CHECK (user_type = ANY (ARRAY['customer'::text, 'owner'::text, 'merchant'::text, 'admin'::text])),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.office_spaces
CREATE TABLE IF NOT EXISTS public.office_spaces (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner_id uuid,
  title text,
  description text,
  address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'USA'::text,
  latitude numeric,
  longitude numeric,
  photos text[] DEFAULT '{}'::text[],
  amenities text[] DEFAULT '{}'::text[],
  capacity integer,
  hourly_price numeric,
  daily_price numeric,
  weekly_price numeric,
  monthly_price numeric,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.storage_spaces
CREATE TABLE IF NOT EXISTS public.storage_spaces (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  owner_id uuid,
  title text,
  description text,
  address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'USA'::text,
  latitude numeric,
  longitude numeric,
  photos text[] DEFAULT '{}'::text[],
  storage_type text CHECK (storage_type = ANY (ARRAY['shelf'::text, 'room'::text, 'warehouse'::text])),
  length_ft numeric,
  width_ft numeric,
  height_ft numeric,
  features text[] DEFAULT '{}'::text[],
  monthly_price numeric,
  annual_price numeric,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  is_available boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  merchant_id uuid,
  storage_id uuid,
  title text,
  description text,
  category text,
  subcategory text,
  price numeric,
  images text[] DEFAULT '{}'::text[],
  inventory integer DEFAULT 0,
  sku text UNIQUE,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id uuid,
  space_id uuid,
  start_date timestamptz,
  end_date timestamptz,
  total_price numeric,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])),
  payment_id uuid,
  cancellation_policy jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.storage_rentals
CREATE TABLE IF NOT EXISTS public.storage_rentals (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  merchant_id uuid,
  storage_id uuid,
  start_date date,
  end_date date,
  monthly_rate numeric,
  total_amount numeric,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])),
  payment_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id uuid,
  total_amount numeric,
  shipping_address jsonb,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  payment_id uuid,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id uuid,
  product_id uuid,
  quantity integer,
  unit_price numeric,
  total_price numeric,
  created_at timestamptz DEFAULT now()
);

-- Table: public.reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid,
  target_id uuid,
  target_type text CHECK (target_type = ANY (ARRAY['office'::text, 'product'::text, 'storage'::text])),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  photos text[] DEFAULT '{}'::text[],
  response text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid,
  amount numeric,
  currency text DEFAULT 'USD'::text,
  payment_method text,
  payment_gateway text,
  transaction_id text UNIQUE,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid,
  type text,
  title text,
  message text,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table: public.messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  conversation_id uuid,
  sender_id uuid,
  receiver_id uuid,
  content text,
  attachments text[] DEFAULT '{}'::text[],
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table: public.storage_spaces -> foreign keys, indexes exist referencing public.profiles.id
-- Table: public.office_spaces -> foreign keys referencing public.profiles.id
-- Table relationships (foreign keys) as discovered in source:
ALTER TABLE IF EXISTS auth.one_time_tokens ADD CONSTRAINT IF NOT EXISTS one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS public.profiles ADD CONSTRAINT IF NOT EXISTS profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS auth.identities ADD CONSTRAINT IF NOT EXISTS identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS auth.refresh_tokens ADD CONSTRAINT IF NOT EXISTS refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id);
ALTER TABLE IF EXISTS auth.mfa_factors ADD CONSTRAINT IF NOT EXISTS mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS auth.mfa_challenges ADD CONSTRAINT IF NOT EXISTS mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id);
ALTER TABLE IF EXISTS auth.mfa_amr_claims ADD CONSTRAINT IF NOT EXISTS mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id);
ALTER TABLE IF EXISTS auth.oauth_consents ADD CONSTRAINT IF NOT EXISTS oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS auth.oauth_consents ADD CONSTRAINT IF NOT EXISTS oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id);
ALTER TABLE IF EXISTS auth.oauth_authorizations ADD CONSTRAINT IF NOT EXISTS oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE IF EXISTS auth.oauth_authorizations ADD CONSTRAINT IF NOT EXISTS oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id);
-- Public schema foreign keys:
ALTER TABLE IF EXISTS public.office_spaces ADD CONSTRAINT IF NOT EXISTS office_spaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.storage_spaces ADD CONSTRAINT IF NOT EXISTS storage_spaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.products ADD CONSTRAINT IF NOT EXISTS products_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.products ADD CONSTRAINT IF NOT EXISTS products_storage_id_fkey FOREIGN KEY (storage_id) REFERENCES public.storage_spaces(id);
ALTER TABLE IF EXISTS public.bookings ADD CONSTRAINT IF NOT EXISTS bookings_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.office_spaces(id);
ALTER TABLE IF EXISTS public.bookings ADD CONSTRAINT IF NOT EXISTS bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.storage_rentals ADD CONSTRAINT IF NOT EXISTS storage_rentals_storage_id_fkey FOREIGN KEY (storage_id) REFERENCES public.storage_spaces(id);
ALTER TABLE IF EXISTS public.storage_rentals ADD CONSTRAINT IF NOT EXISTS storage_rentals_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.orders ADD CONSTRAINT IF NOT EXISTS orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.order_items ADD CONSTRAINT IF NOT EXISTS order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE IF EXISTS public.order_items ADD CONSTRAINT IF NOT EXISTS order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE IF EXISTS public.reviews ADD CONSTRAINT IF NOT EXISTS reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.payments ADD CONSTRAINT IF NOT EXISTS payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.notifications ADD CONSTRAINT IF NOT EXISTS notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.messages ADD CONSTRAINT IF NOT EXISTS messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS public.messages ADD CONSTRAINT IF NOT EXISTS messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id);
ALTER TABLE IF EXISTS storage.objects ADD CONSTRAINT IF NOT EXISTS objects_bucketId_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
ALTER TABLE IF EXISTS storage.s3_multipart_uploads ADD CONSTRAINT IF NOT EXISTS s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
ALTER TABLE IF EXISTS storage.s3_multipart_uploads_parts ADD CONSTRAINT IF NOT EXISTS s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id);
ALTER TABLE IF EXISTS storage.s3_multipart_uploads_parts ADD CONSTRAINT IF NOT EXISTS s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
ALTER TABLE IF EXISTS storage.vector_indexes ADD CONSTRAINT IF NOT EXISTS vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);
ALTER TABLE IF EXISTS storage.buckets ADD CONSTRAINT IF NOT EXISTS buckets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

-- ======================================
-- Row-Level Security (RLS) Policies
-- ======================================
-- Note: Ensure RLS is enabled on target tables before creating policies:
-- ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING ((auth.uid()) = id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public USING ((auth.uid()) = id);

-- public.office_spaces
ALTER TABLE public.office_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their office spaces" ON public.office_spaces FOR ALL TO public USING ((auth.uid()) = owner_id) WITH CHECK ((auth.uid()) = owner_id);
CREATE POLICY "Anyone can view active office spaces" ON public.office_spaces FOR SELECT TO public USING (is_active = true);

-- public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants can manage their products" ON public.products FOR ALL TO public USING ((auth.uid()) = merchant_id) WITH CHECK ((auth.uid()) = merchant_id);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO public USING (is_active = true);

-- public.bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their bookings" ON public.bookings FOR SELECT TO public USING ((auth.uid()) = customer_id OR (auth.uid() IN (SELECT office_spaces.owner_id FROM public.office_spaces WHERE (public.office_spaces.id = public.bookings.space_id))));

-- public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT TO public USING ((auth.uid()) = customer_id);

-- public.reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO public WITH CHECK ((auth.uid()) = user_id);
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT TO public USING (true);

-- realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
-- (No explicit policies exported beyond enabling RLS in the listing; add custom policies as needed)

-- storage.buckets and storage.objects often have RLS policies in Supabase projects (not enumerated fully here).
-- If you rely on storage RLS, recreate the necessary policies (for example, to restrict access to a user's folder).

-- ======================================
-- Additional Notes & Recommended Indexes
-- ======================================
-- Create indexes on columns used in RLS policies for performance:
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_office_spaces_owner_id ON public.office_spaces (owner_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON public.products (merchant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space_id ON public.bookings (space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);

-- ======================================
-- End of schema
-- ======================================

-- Validation summary:
-- - Tables, columns, defaults, primary keys and many foreign keys were included from the source listing.
-- - RLS policies present in the source were added for the tables where they were reported.
-- - Some Postgres user-defined types/enums (e.g., auth.aal_level, auth.factor_type, storage.buckettype, etc.)
--   are referenced; if they do not already exist in a target database, create them or adjust the DDL.
-- - Some platform helper functions, triggers, and service-managed objects (for auth, realtime broadcast, storage)
--   may not be exported here. Recreate or adjust them using Supabase-provided SQL found in the project dashboard
--   if you rely on them (for example, realtime trigger functions or storage helpers).
-- - If you want, I can produce a ZIP-ready SQL dump (full CREATE TYPE statements for enums and any missing functions),
--   or expand this file to include triggers and exact checks for every constraint shown in the source.