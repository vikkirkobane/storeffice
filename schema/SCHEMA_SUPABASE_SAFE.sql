-- ============================================================================
-- STOREFFICE SUPABASE SAFE SCHEMA - FLUTTER & NEXT.JS COMPATIBLE
-- ============================================================================
-- This schema avoids conflicts with Supabase auth.users table modifications
-- Safe for Supabase deployment without RLS conflicts
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================

-- Profiles table (extends auth.users for custom user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  profile_photo TEXT,
  roles TEXT[] DEFAULT ARRAY['customer']::TEXT[],
  -- Flutter-specific fields
  device_tokens TEXT[], -- For push notifications (FCM tokens)
  preferences JSONB DEFAULT '{}'::jsonb, -- App preferences, language, etc.
  last_seen TIMESTAMP WITH TIME ZONE,
  app_version TEXT, -- Track app version for compatibility
  platform TEXT, -- 'flutter', 'web', 'ios', 'android'
  -- Status fields
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- Office spaces table
CREATE TABLE IF NOT EXISTS public.office_spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {address, city, state, zipCode, country, coordinates: [lng, lat]}
  photos TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  capacity INTEGER DEFAULT 1,
  pricing JSONB NOT NULL, -- {hourly, daily, weekly, monthly}
  availability JSONB[] DEFAULT '{}', -- Array of availability rules
  -- Mobile-optimized fields
  thumbnail_photo TEXT, -- Compressed thumbnail for mobile lists
  search_keywords TEXT[], -- For mobile search optimization
  -- Metrics
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0, -- Track views for analytics
  favorite_count INTEGER DEFAULT 0, -- Track favorites
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE, -- For promoting listings
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage spaces table
CREATE TABLE IF NOT EXISTS public.storage_spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location JSONB NOT NULL, -- {address, city, state, zipCode, country, coordinates: [lng, lat]}
  photos TEXT[] DEFAULT '{}',
  storage_type TEXT CHECK (storage_type IN ('shelf', 'room', 'warehouse')),
  dimensions JSONB, -- {length, width, height, unit}
  features TEXT[], -- climate-controlled, secure, etc.
  pricing JSONB, -- {monthly, annual}
  -- Mobile-optimized fields
  thumbnail_photo TEXT,
  search_keywords TEXT[],
  -- Metrics
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES public.profiles(id) NOT NULL,
  storage_id UUID REFERENCES public.storage_spaces(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  inventory INTEGER DEFAULT 0,
  sku TEXT,
  -- Mobile-optimized fields
  thumbnail_image TEXT,
  search_keywords TEXT[],
  tags TEXT[], -- For better categorization
  -- Shipping & Mobile considerations
  weight DECIMAL(8,2), -- For shipping calculations
  dimensions JSONB, -- {length, width, height, unit}
  shipping_info JSONB, -- Shipping details
  -- Metrics
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  space_id UUID REFERENCES public.office_spaces(id) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_id UUID,
  -- Mobile-specific fields
  check_in_time TIMESTAMP WITH TIME ZONE, -- Actual check-in
  check_out_time TIMESTAMP WITH TIME ZONE, -- Actual check-out
  qr_code TEXT, -- For mobile check-in
  special_requests TEXT,
  -- Cancellation
  cancellation_policy JSONB,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage rentals table
CREATE TABLE IF NOT EXISTS public.storage_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES public.profiles(id) NOT NULL,
  storage_id UUID REFERENCES public.storage_spaces(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  payment_schedule TEXT DEFAULT 'monthly' CHECK (payment_schedule IN ('monthly', 'quarterly', 'annual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  items JSONB NOT NULL, -- Array of {productId, quantity, price}
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  -- Mobile-optimized tracking
  tracking_number TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  delivery_instructions TEXT,
  payment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('office', 'product', 'storage')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  response TEXT, -- Owner/Merchant response
  response_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  -- Mobile considerations
  helpful_count INTEGER DEFAULT 0, -- Users can mark reviews as helpful
  reported_count INTEGER DEFAULT 0, -- Track inappropriate reports
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (for messaging)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants UUID[] NOT NULL,
  related_listing_id UUID,
  related_listing_type TEXT CHECK (related_listing_type IN ('office', 'storage', 'product')),
  title TEXT,
  last_message_id UUID,
  last_message_preview TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'booking', 'payment')),
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of {url, type, name, size}
  metadata JSONB DEFAULT '{}'::jsonb, -- Extra data for special message types
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  reply_to_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_gateway TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Mobile payment considerations
  payment_source TEXT, -- 'mobile', 'web'
  failure_reason TEXT,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (optimized for mobile push notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking', 'order', 'payment', 'message', 'review', 'promotion', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  -- Mobile-specific fields
  click_action TEXT, -- Deep link for mobile apps
  image_url TEXT, -- For rich notifications
  sound TEXT DEFAULT 'default',
  badge_count INTEGER,
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE, -- Track if push notification was sent
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('office', 'product', 'storage')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

-- User carts table (for e-commerce)
CREATE TABLE IF NOT EXISTS public.user_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Analytics table (for tracking app usage)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  platform TEXT, -- 'flutter', 'web', 'ios', 'android'
  app_version TEXT,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App feedback table
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT,
  app_version TEXT,
  device_info JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN(roles);

-- Office spaces indexes
CREATE INDEX IF NOT EXISTS idx_office_spaces_owner_id ON public.office_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_office_spaces_location ON public.office_spaces USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_office_spaces_pricing ON public.office_spaces USING GIN(pricing);
CREATE INDEX IF NOT EXISTS idx_office_spaces_is_active ON public.office_spaces(is_active);
CREATE INDEX IF NOT EXISTS idx_office_spaces_rating ON public.office_spaces(rating DESC);
CREATE INDEX IF NOT EXISTS idx_office_spaces_created_at ON public.office_spaces(created_at DESC);

-- Storage spaces indexes
CREATE INDEX IF NOT EXISTS idx_storage_spaces_owner_id ON public.storage_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_storage_spaces_location ON public.storage_spaces USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_storage_spaces_is_available ON public.storage_spaces(is_available);
CREATE INDEX IF NOT EXISTS idx_storage_spaces_rating ON public.storage_spaces(rating DESC);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space_id ON public.bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target ON public.favorites(target_id, target_type);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, platform)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'platform', 'web')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_target_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_table TEXT;
  avg_rating DECIMAL(3,2);
  total_reviews INTEGER;
BEGIN
  -- Determine target table
  target_table := COALESCE(NEW.target_type, OLD.target_type);

  -- Calculate new rating and review count
  SELECT AVG(rating), COUNT(*) INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE target_id = COALESCE(NEW.target_id, OLD.target_id) 
  AND target_type = target_table;

  -- Update the appropriate table
  IF target_table = 'office' THEN
    UPDATE public.office_spaces
    SET rating = COALESCE(avg_rating, 0),
        review_count = total_reviews
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    
  ELSIF target_table = 'product' THEN
    UPDATE public.products
    SET rating = COALESCE(avg_rating, 0),
        review_count = total_reviews
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    
  ELSIF target_table = 'storage' THEN
    UPDATE public.storage_spaces
    SET rating = COALESCE(avg_rating, 0),
        review_count = total_reviews
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update favorite count
CREATE OR REPLACE FUNCTION public.update_favorite_count()
RETURNS TRIGGER AS $$
DECLARE
  target_table TEXT;
  fav_count INTEGER;
BEGIN
  target_table := COALESCE(NEW.target_type, OLD.target_type);

  -- Count favorites
  SELECT COUNT(*) INTO fav_count
  FROM public.favorites
  WHERE target_id = COALESCE(NEW.target_id, OLD.target_id)
  AND target_type = target_table;

  -- Update the appropriate table
  IF target_table = 'office' THEN
    UPDATE public.office_spaces
    SET favorite_count = fav_count
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    
  ELSIF target_table = 'product' THEN
    UPDATE public.products
    SET favorite_count = fav_count
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
    
  ELSIF target_table = 'storage' THEN
    UPDATE public.storage_spaces
    SET favorite_count = fav_count
    WHERE id = COALESCE(NEW.target_id, OLD.target_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to validate booking overlaps
CREATE OR REPLACE FUNCTION public.validate_booking_time()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping bookings for the same office space
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE space_id = NEW.space_id
    AND status NOT IN ('cancelled', 'no_show')
    AND id != COALESCE(NEW.id, gen_random_uuid())
    AND (
      (NEW.start_date < end_date AND NEW.end_date > start_date)
    )
  ) THEN
    RAISE EXCEPTION 'The office space is already booked for the selected time period';
  END IF;
  
  -- Validate dates
  IF NEW.start_date >= NEW.end_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;
  
  -- Validate future bookings only
  IF NEW.start_date <= NOW() THEN
    RAISE EXCEPTION 'Booking must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Updated at triggers
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_office_spaces_updated_at
  BEFORE UPDATE ON public.office_spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_storage_spaces_updated_at
  BEFORE UPDATE ON public.storage_spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_storage_rentals_updated_at
  BEFORE UPDATE ON public.storage_rentals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_carts_updated_at
  BEFORE UPDATE ON public.user_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business logic triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER validate_booking_time_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_time();

CREATE OR REPLACE TRIGGER update_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_target_rating();

CREATE OR REPLACE TRIGGER update_favorite_count_on_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_favorite_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view public profile info" ON public.profiles
  FOR SELECT USING (TRUE);

-- Office spaces policies
CREATE POLICY "Anyone can view active office spaces" ON public.office_spaces
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage own office spaces" ON public.office_spaces
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create office spaces" ON public.office_spaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Storage spaces policies
CREATE POLICY "Anyone can view available storage spaces" ON public.storage_spaces
  FOR SELECT USING (is_available = true);

CREATE POLICY "Owners can manage own storage spaces" ON public.storage_spaces
  FOR ALL USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Merchants can manage own products" ON public.products
  FOR ALL USING (auth.uid() = merchant_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() IN (SELECT owner_id FROM public.office_spaces WHERE id = space_id)
  );

CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (SELECT unnest(participants) FROM public.conversations WHERE id = conversation_id)
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (SELECT unnest(participants) FROM public.conversations WHERE id = conversation_id)
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can view own cart" ON public.user_carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON public.user_carts
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies (users can only see their own data)
CREATE POLICY "Users can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Feedback policies
CREATE POLICY "Users can create feedback" ON public.app_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own feedback" ON public.app_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FLUTTER-SPECIFIC FUNCTIONS
-- ============================================================================

-- Function to update user's last seen timestamp (for online status)
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = NOW(), is_online = true 
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user offline
CREATE OR REPLACE FUNCTION public.set_user_offline()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET is_online = false 
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby listings (requires coordinates)
CREATE OR REPLACE FUNCTION public.get_nearby_office_spaces(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  distance_km DOUBLE PRECISION,
  pricing JSONB,
  rating DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.id,
    os.title,
    -- Simple distance calculation (for more accuracy, use PostGIS)
            SQRT(POW(69.1 * (((os.location->>'coordinates')::jsonb->>1)::double precision - user_lat), 2) +
         POW(69.1 * (((os.location->>'coordinates')::jsonb->>0)::double precision - user_lng) * 
         COS(user_lat / 57.3)), 2)) as distance_km,
    os.pricing,
    os.rating
  FROM public.office_spaces os
  WHERE os.is_active = true
    AND SQRT(POW(69.1 * (((os.location->>'coordinates')::jsonb->>1)::double precision - user_lat), 2) +
           POW(69.1 * (((os.location->>'coordinates')::jsonb->>0)::double precision - user_lng) * 
           COS(user_lat / 57.3)), 2)) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update device token for push notifications
CREATE OR REPLACE FUNCTION public.update_device_token(token TEXT, platform TEXT DEFAULT 'flutter')
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    device_tokens = CASE 
      WHEN token = ANY(COALESCE(device_tokens, ARRAY[]::TEXT[]))
      THEN device_tokens
      ELSE COALESCE(device_tokens, ARRAY[]::TEXT[]) || ARRAY[token]
    END,
    platform = update_device_token.platform,
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA FUNCTIONS (FOR DEVELOPMENT/TESTING)
-- ============================================================================

-- Function to create sample data (call this after schema setup for testing)
CREATE OR REPLACE FUNCTION public.create_sample_data()
RETURNS void AS $$
BEGIN
  -- This function can be used to populate sample data for development
  -- Implementation would go here
  RAISE NOTICE 'Sample data creation function ready - implement as needed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SCHEMA COMPLETE - SAFE FOR SUPABASE
-- ============================================================================
-- This schema is now ready for both Flutter mobile app and Next.js web app
-- Features included:
-- 1. Complete table structure for Storeffice platform
-- 2. Mobile-optimized fields (device tokens, push notifications, etc.)
-- 3. Performance indexes for mobile queries
-- 4. Row Level Security policies
-- 5. Business logic functions and triggers  
-- 6. Flutter-specific functions for common mobile operations
-- 7. Analytics and feedback tracking
-- 8. Comprehensive messaging system
-- 9. Location-based queries support
-- 10. Cross-platform compatibility
-- 11. Supabase-safe (no conflicts with auth.users table)
-- ============================================================================