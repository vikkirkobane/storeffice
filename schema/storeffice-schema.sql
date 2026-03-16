-- ================================================================================================
-- STOREFFICE DATABASE SCHEMA
-- Compatible with Supabase (PostgreSQL)
-- ================================================================================================

-- 1) Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2) Profiles table (users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_type TEXT CHECK (user_type IN ('customer', 'owner', 'merchant', 'admin')) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Office Spaces
CREATE TABLE IF NOT EXISTS public.office_spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'USA',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    photos TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    capacity INTEGER NOT NULL,
    hourly_price DECIMAL(10,2),
    daily_price DECIMAL(10,2),
    weekly_price DECIMAL(10,2),
    monthly_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Storage Spaces
CREATE TABLE IF NOT EXISTS public.storage_spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'USA',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    photos TEXT[] DEFAULT '{}',
    storage_type TEXT CHECK (storage_type IN ('shelf', 'room', 'warehouse')) NOT NULL,
    length_ft DECIMAL(8,2),
    width_ft DECIMAL(8,2),
    height_ft DECIMAL(8,2),
    features TEXT[] DEFAULT '{}',
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5) Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id UUID REFERENCES public.profiles(id) NOT NULL,
    storage_id UUID REFERENCES public.storage_spaces(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    price DECIMAL(10,2) NOT NULL,
    images TEXT[] DEFAULT '{}',
    inventory INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6) Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    space_id UUID REFERENCES public.office_spaces(id) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('pending','confirmed','cancelled','completed')) DEFAULT 'pending',
    payment_id UUID,
    cancellation_policy JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7) Storage Rentals
CREATE TABLE IF NOT EXISTS public.storage_rentals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    merchant_id UUID REFERENCES public.profiles(id) NOT NULL,
    storage_id UUID REFERENCES public.storage_spaces(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('active','expired','cancelled')) DEFAULT 'active',
    payment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8) Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    status TEXT CHECK (status IN ('pending','processing','shipped','delivered','cancelled')) DEFAULT 'pending',
    payment_id UUID,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9) Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10) Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('office','product','storage')) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    photos TEXT[] DEFAULT '{}',
    response TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11) Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    payment_gateway TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending','completed','failed','refunded')) DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12) Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13) Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Office spaces
CREATE INDEX IF NOT EXISTS idx_office_spaces_owner ON public.office_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_office_spaces_city ON public.office_spaces(city);
CREATE INDEX IF NOT EXISTS idx_office_spaces_active ON public.office_spaces(is_active);
CREATE INDEX IF NOT EXISTS idx_office_spaces_price ON public.office_spaces(hourly_price);

-- Storage spaces
CREATE INDEX IF NOT EXISTS idx_storage_spaces_owner ON public.storage_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_storage_spaces_city ON public.storage_spaces(city);
CREATE INDEX IF NOT EXISTS idx_storage_spaces_active ON public.storage_spaces(is_active);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_merchant ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_space ON public.bookings(space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can view and update their own profile
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles 
        FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles 
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Office spaces: anyone can view active, owners can manage their own
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'office_spaces' 
        AND policyname = 'Anyone can view active office spaces'
    ) THEN
        CREATE POLICY "Anyone can view active office spaces" ON public.office_spaces 
        FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'office_spaces' 
        AND policyname = 'Owners can manage their office spaces'
    ) THEN
        CREATE POLICY "Owners can manage their office spaces" ON public.office_spaces 
        FOR ALL USING (auth.uid() = owner_id);
    END IF;
END $$;

-- Storage spaces: similar to office spaces
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'storage_spaces' 
        AND policyname = 'Anyone can view active storage spaces'
    ) THEN
        CREATE POLICY "Anyone can view active storage spaces" ON public.storage_spaces 
        FOR SELECT USING (is_active = true AND is_available = true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'storage_spaces' 
        AND policyname = 'Owners can manage their storage spaces'
    ) THEN
        CREATE POLICY "Owners can manage their storage spaces" ON public.storage_spaces 
        FOR ALL USING (auth.uid() = owner_id);
    END IF;
END $$;

-- Products: anyone can view active, merchants can manage their own
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Anyone can view active products'
    ) THEN
        CREATE POLICY "Anyone can view active products" ON public.products 
        FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Merchants can manage their products'
    ) THEN
        CREATE POLICY "Merchants can manage their products" ON public.products 
        FOR ALL USING (auth.uid() = merchant_id);
    END IF;
END $$;

-- Bookings: customers can view their own, owners can view their space bookings
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND policyname = 'Customers can view their bookings'
    ) THEN
        CREATE POLICY "Customers can view their bookings" ON public.bookings 
        FOR SELECT USING (auth.uid() = customer_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND policyname = 'Space owners can view bookings for their spaces'
    ) THEN
        CREATE POLICY "Space owners can view bookings for their spaces" ON public.bookings 
        FOR SELECT USING (
            auth.uid() IN (
                SELECT owner_id FROM public.office_spaces WHERE id = space_id
            )
        );
    END IF;
END $$;

-- Reviews: anyone can read, users can create
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'reviews' 
        AND policyname = 'Anyone can read reviews'
    ) THEN
        CREATE POLICY "Anyone can read reviews" ON public.reviews 
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'reviews' 
        AND policyname = 'Users can create reviews'
    ) THEN
        CREATE POLICY "Users can create reviews" ON public.reviews 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Orders: customers can view their own, merchants can view orders for their products
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Customers can view their orders'
    ) THEN
        CREATE POLICY "Customers can view their orders" ON public.orders 
        FOR SELECT USING (auth.uid() = customer_id);
    END IF;
END $$;

-- Order items: accessible via order ownership
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND policyname = 'Order items accessible via order'
    ) THEN
        CREATE POLICY "Order items accessible via order" ON public.order_items 
        FOR SELECT USING (
            auth.uid() IN (
                SELECT customer_id FROM public.orders WHERE id = order_id
            )
        );
    END IF;
END $$;

-- Notifications: users can view their own
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can view their notifications'
    ) THEN
        CREATE POLICY "Users can view their notifications" ON public.notifications 
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Messages: senders and receivers can view
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE schemaname = 'public' 
        AND tablename = 'messages' 
        AND policyname = 'Users can view their messages'
    ) THEN
        CREATE POLICY "Users can view their messages" ON public.messages 
        FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    END IF;
END $$;

-- ========================================
-- TRIGGERS FOR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_profiles_updated_at') THEN
        CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_office_spaces_updated_at') THEN
        CREATE TRIGGER handle_office_spaces_updated_at BEFORE UPDATE ON public.office_spaces 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_storage_spaces_updated_at') THEN
        CREATE TRIGGER handle_storage_spaces_updated_at BEFORE UPDATE ON public.storage_spaces 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_products_updated_at') THEN
        CREATE TRIGGER handle_products_updated_at BEFORE UPDATE ON public.products 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_bookings_updated_at') THEN
        CREATE TRIGGER handle_bookings_updated_at BEFORE UPDATE ON public.bookings 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_orders_updated_at') THEN
        CREATE TRIGGER handle_orders_updated_at BEFORE UPDATE ON public.orders 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_reviews_updated_at') THEN
        CREATE TRIGGER handle_reviews_updated_at BEFORE UPDATE ON public.reviews 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- End of schema