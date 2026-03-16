# Supabase Integration Guide for Storeffice

## 🚀 Schema Deployment Status

✅ **SCHEMA READY FOR SUPABASE DEPLOYMENT**

Use `SCHEMA_SUPABASE_SAFE.sql` for deployment to avoid RLS conflicts with auth.users table.

## 📋 Steps to Deploy

### 1. Deploy Schema to Supabase

1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `SCHEMA_SUPABASE_SAFE.sql` 
3. Run the script (it will create all tables, indexes, functions, and RLS policies)

### 2. Environment Variables

Create/Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL (for migrations if needed)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
```

### 3. Build Fixes Applied

✅ Fixed Supabase server client import issues
✅ Updated database types to match schema
✅ Created proper exports for both client and server
✅ Resolved module resolution conflicts

## 🏗️ Schema Features

### Core Tables
- `profiles` - User profiles (extends auth.users)
- `office_spaces` - Office space listings
- `storage_spaces` - Storage space listings  
- `products` - Product listings
- `bookings` - Office space bookings
- `storage_rentals` - Storage space rentals
- `orders` - Product orders
- `reviews` - Reviews for all listing types
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `payments` - Payment records
- `notifications` - Push notifications
- `favorites` - User favorites
- `user_carts` - Shopping cart items
- `analytics_events` - App usage analytics
- `app_feedback` - User feedback

### Flutter/Mobile Optimizations
- Device token storage for push notifications
- Platform tracking (web, ios, android, flutter)
- Optimized indexes for mobile queries
- Compressed thumbnail fields for faster loading
- Location-based search functions

### Security Features
- Row Level Security (RLS) enabled on all tables
- Proper authentication policies
- Owner/customer access controls
- Business logic validation triggers

### Performance Features
- Comprehensive indexing strategy
- GIN indexes for JSONB and array columns
- Full-text search capabilities
- Optimized queries for mobile apps

## 🛠️ Development Workflow

### Adding New Features
1. Update database schema in `SCHEMA_SUPABASE_SAFE.sql`
2. Update TypeScript types in `src/lib/database.ts`
3. Create API endpoints in `src/app/api/`
4. Add frontend components and hooks

### Testing Schema Changes
1. Test locally with Supabase CLI
2. Apply to staging environment
3. Run integration tests
4. Deploy to production

## 📱 Flutter App Integration

The schema is fully compatible with the existing Flutter app. Key integration points:

### Authentication
- Uses Supabase Auth with profiles table extension
- Automatic profile creation on signup
- Device token management for push notifications

### Real-time Features
- Real-time subscriptions for messages
- Live booking status updates
- Push notifications via FCM

### Offline Support
- Local caching strategies
- Sync conflict resolution
- Progressive data loading

## 🔧 API Structure

All API endpoints follow RESTful conventions:
- `GET /api/[resource]` - List resources
- `GET /api/[resource]/[id]` - Get specific resource  
- `POST /api/[resource]` - Create new resource
- `PUT /api/[resource]/[id]` - Update resource
- `DELETE /api/[resource]/[id]` - Delete resource

### Authentication
All API routes use Supabase RLS for security. Users can only access their own data unless explicitly granted permission.

### Error Handling
Consistent error response format across all endpoints with proper HTTP status codes.

## 📊 Analytics & Monitoring

### Built-in Analytics
- User activity tracking
- Feature usage metrics
- Performance monitoring
- Error reporting

### Business Metrics
- Booking conversion rates
- Revenue tracking
- User engagement
- Platform growth

## 🎯 Next Steps

1. ✅ Deploy schema using `SCHEMA_SUPABASE_SAFE.sql`
2. ✅ Update environment variables
3. 🔄 Fix remaining build errors (in progress)
4. ⏳ Test all API endpoints
5. ⏳ Deploy to staging environment
6. ⏳ Conduct integration testing
7. ⏳ Production deployment

## 🆘 Troubleshooting

### Common Issues
1. **RLS Policy Conflicts**: Use the safe schema version
2. **Import Errors**: Ensure proper TypeScript configuration
3. **Authentication Issues**: Check environment variables
4. **Performance Issues**: Verify indexes are created

### Support
- Check Supabase logs for database errors
- Use TypeScript compiler for build issues
- Test API endpoints with proper authentication headers

---

**Status**: ✅ Schema Ready | 🔄 Build Fixes In Progress | ⏳ Testing Pending