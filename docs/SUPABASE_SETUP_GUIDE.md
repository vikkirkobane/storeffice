# 🚀 SUPABASE SETUP GUIDE FOR STOREFFICE

## ✅ ISSUE RESOLVED!

The error `ERROR: 42501: must be owner of table users` occurred because Supabase has a built-in `auth.users` table that we cannot modify. 

**Solution:** I've created a **Supabase-compatible schema** that works with their authentication system!

## 📋 STEP-BY-STEP SETUP

### 1. 🌟 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project
4. Wait for project initialization (~2 minutes)

### 2. 📊 Run the Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** 

✅ **This will create all 14 tables, functions, triggers, and policies!**

### 3. 🔐 Get Your Credentials
In your Supabase project settings:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. 🎯 Test the Setup
Run this query in SQL Editor to verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all these tables:
- ✅ analytics_events
- ✅ bookings  
- ✅ cart_items
- ✅ favorites
- ✅ messages
- ✅ notifications
- ✅ office_spaces
- ✅ orders
- ✅ payments
- ✅ products
- ✅ profiles
- ✅ reviews
- ✅ storage_rentals
- ✅ storage_spaces

## 🔄 KEY DIFFERENCES FROM ORIGINAL SCHEMA

### ✅ **Supabase Authentication Integration**
- Uses `auth.users` table (built-in)
- `profiles` table extends user data
- Auto-creates profile when user signs up
- Compatible with Supabase Auth UI

### ✅ **Mobile Optimization Enhanced**
```sql
-- Push notification fields
device_tokens TEXT[] DEFAULT ARRAY[]::TEXT[],
preferences JSONB DEFAULT '{}'::JSONB,
last_seen TIMESTAMP WITH TIME ZONE,
platform TEXT, -- 'flutter', 'web', 'ios', 'android'
is_online BOOLEAN DEFAULT FALSE,

-- Mobile-specific functions
update_last_seen() -- Track user activity
update_device_token() -- Manage FCM tokens  
get_nearby_office_spaces() -- Location queries
get_user_dashboard_data() -- Mobile dashboard
```

### ✅ **Flutter-Specific Features**
- **Real-time subscriptions** ready
- **Push notification** token management
- **Offline sync** status tracking
- **Location-based** queries with PostGIS
- **Mobile analytics** tracking
- **Cross-platform** compatibility

## 📱 FLUTTER INTEGRATION

### Setup Supabase Flutter
```yaml
# pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
```

```dart
// main.dart
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

### Authentication Example
```dart
// Sign up
final response = await supabase.auth.signUp(
  email: 'user@example.com',
  password: 'password',
  data: {
    'first_name': 'John',
    'last_name': 'Doe',
  },
);

// Sign in  
await supabase.auth.signInWithPassword(
  email: 'user@example.com',
  password: 'password',
);

// Update online status
await supabase.rpc('update_last_seen');

// Update FCM token
await supabase.rpc('update_device_token', params: {
  'token': 'fcm_token_here',
  'platform_type': 'flutter'
});
```

### Real-time Subscriptions
```dart
// Listen to new messages
supabase
  .channel('messages')
  .onPostgresChanges(
    event: PostgresChangeEvent.insert,
    schema: 'public',
    table: 'messages',
    filter: PostgresChangeFilter(
      type: PostgresChangeFilterType.eq,
      column: 'receiver_id',
      value: userId,
    ),
    callback: (payload) {
      // Handle new message
      print('New message: ${payload.newRecord}');
    },
  )
  .subscribe();
```

## 🌐 NEXT.JS INTEGRATION

### Setup Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Create Supabase Client
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

### API Route Example
```typescript
// app/api/office-spaces/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('office_spaces')
    .select('*')
    .eq('is_active', true)
    
  return Response.json({ data, error })
}
```

## 🔒 SECURITY FEATURES

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- ✅ Users can only access their own data
- ✅ Public data (listings) visible to all
- ✅ Owner/merchant permissions enforced
- ✅ Admin access controlled

### Example Policies
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Anyone can view active office spaces
CREATE POLICY "Anyone can view active office spaces" 
ON public.office_spaces FOR SELECT 
USING (is_active = true);

-- Owners can manage own spaces
CREATE POLICY "Owners can manage own spaces" 
ON public.office_spaces FOR ALL 
USING (auth.uid() = owner_id);
```

## 📊 STORAGE SETUP

### Create Storage Buckets
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('office-photos', 'office-photos', true),
('product-images', 'product-images', true),
('message-attachments', 'message-attachments', false);
```

### Storage Policies
```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public viewing of avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

## 🚀 PERFORMANCE OPTIMIZATION

### Database Indexes
The schema includes 40+ optimized indexes:
```sql
-- Location-based queries (mobile maps)
CREATE INDEX idx_office_spaces_location ON public.office_spaces USING GIST(coordinates);

-- Search optimization  
CREATE INDEX idx_products_search ON public.products USING GIN(search_keywords);

-- Mobile-specific
CREATE INDEX idx_profiles_is_online ON public.profiles(is_online) WHERE is_online = true;
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
```

### Query Optimization
```sql
-- Get nearby office spaces (mobile)
SELECT * FROM public.get_nearby_office_spaces(37.7749, -122.4194, 10);

-- Get user dashboard data (mobile)
SELECT public.get_user_dashboard_data();
```

## 📈 ANALYTICS & MONITORING

### Event Tracking
```sql
-- Track user events
INSERT INTO public.analytics_events (
  user_id, session_id, event_type, platform, custom_data
) VALUES (
  auth.uid(), 'session_123', 'page_view', 'flutter', 
  '{"page": "office_spaces", "search_query": "downtown"}'
);
```

### Mobile Analytics
```dart
// Flutter analytics service
class AnalyticsService {
  static Future<void> trackEvent({
    required String eventType,
    Map<String, dynamic>? eventData,
  }) async {
    await supabase.from('analytics_events').insert({
      'user_id': supabase.auth.currentUser?.id,
      'event_type': eventType,
      'event_data': eventData ?? {},
      'platform': 'flutter',
      'session_id': await getSessionId(),
    });
  }
}
```

## 🎯 TESTING YOUR SETUP

### 1. Test Authentication
```sql
-- Check if profiles are created automatically
SELECT count(*) FROM public.profiles;
```

### 2. Test Mobile Functions
```sql
-- Test location queries
SELECT public.get_nearby_office_spaces(37.7749, -122.4194, 5);

-- Test dashboard data
SELECT public.get_user_dashboard_data();
```

### 3. Test Real-time
```dart
// Flutter test
supabase
  .channel('test')
  .onPostgresChanges(
    event: PostgresChangeEvent.all,
    schema: 'public', 
    table: 'profiles',
    callback: (payload) => print('Profile updated: $payload'),
  )
  .subscribe();
```

## ✅ DEPLOYMENT CHECKLIST

### Supabase Configuration
- [ ] Project created
- [ ] Schema executed successfully  
- [ ] Storage buckets created
- [ ] RLS policies active
- [ ] API keys obtained

### Flutter App
- [ ] Supabase Flutter SDK integrated
- [ ] Authentication working
- [ ] Real-time subscriptions active
- [ ] Push notifications configured
- [ ] Location services enabled

### Next.js Web App
- [ ] Environment variables set
- [ ] Supabase client configured
- [ ] API routes functional
- [ ] Authentication integrated
- [ ] Build successful

## 🎉 SUCCESS!

Your Storeffice platform now has:
- ✅ **Production-ready database** with 14 tables
- ✅ **Mobile-optimized** for Flutter apps
- ✅ **Web-compatible** for Next.js
- ✅ **Real-time features** built-in
- ✅ **Push notifications** ready
- ✅ **Location services** enabled
- ✅ **Enterprise security** with RLS
- ✅ **Performance optimized** with indexes
- ✅ **Analytics tracking** included

## 🆘 TROUBLESHOOTING

### Common Issues

**1. RLS Policy Errors**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

**2. Missing PostGIS Extension**
```sql
-- Enable PostGIS in SQL Editor
CREATE EXTENSION IF NOT EXISTS "postgis";
```

**3. Auth Trigger Issues**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**4. Flutter Connection Issues**
```dart
// Debug Supabase connection
print('Supabase URL: ${Supabase.instance.client.supabaseUrl}');
print('Is authenticated: ${Supabase.instance.client.auth.currentUser != null}');
```

## 📞 SUPPORT

For issues:
1. Check Supabase dashboard logs
2. Verify environment variables
3. Test with simple queries first
4. Use Supabase Discord community
5. Check Flutter/Next.js documentation

---

**Your Storeffice database is now ready for both Flutter and Next.js deployment! 🚀📱🌐**