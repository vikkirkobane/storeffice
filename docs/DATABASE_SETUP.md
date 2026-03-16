# Storeffice Database Setup Guide

This guide will help you set up the Supabase database for the Storeffice project.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18+ installed
3. **Supabase CLI**: Install with `npm install -g @supabase/cli`

## Quick Setup (Recommended)

### 1. Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: "Storeffice"
5. Enter a strong database password
6. Select a region close to your users
7. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - Project URL
   - `anon` public key
   - `service_role` secret key (be careful with this)

### 3. Configure Environment Variables

Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database connection for server-side operations
DATABASE_URL=your_database_url_here
```

### 4. Run Database Migrations

You have two options to set up your database schema:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql` 
   - `supabase/migrations/20240101000002_indexes.sql`
4. Execute each migration by clicking "Run"

#### Option B: Using Supabase CLI (Recommended for development)

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migrations:
   ```bash
   supabase db push
   ```

### 5. Seed Sample Data (Optional)

For development and testing, you can add sample data:

1. In Supabase Dashboard SQL Editor
2. Copy and paste contents of `supabase/seed.sql`
3. Click "Run"

**Note**: The seed data uses placeholder user IDs. In production, these would be real auth.users IDs.

## Database Schema Overview

### Core Tables

- **profiles**: Extended user information beyond Supabase Auth
- **office_spaces**: Office space listings
- **storage_spaces**: Storage space listings  
- **products**: Product inventory
- **bookings**: Office space reservations
- **orders**: Product purchase orders
- **reviews**: Reviews for spaces and products
- **payments**: Payment transaction records
- **notifications**: User notifications
- **messages**: User-to-user messaging
- **user_carts**: Shopping cart items

### Key Features

- **Row Level Security (RLS)**: All tables have proper security policies
- **Automatic Triggers**: Auto-update timestamps, rating calculations
- **Indexes**: Optimized for common query patterns
- **JSONB Columns**: Flexible data storage for complex objects
- **Full-text Search**: Enabled for products and spaces

## Authentication Flow

The database is designed to work with Supabase Auth:

1. User signs up through Supabase Auth
2. `handle_new_user()` trigger automatically creates profile
3. RLS policies control data access based on auth.uid()

## Local Development with Supabase

### Option 1: Use Remote Database

Simply use your remote Supabase instance for development by configuring the environment variables.

### Option 2: Local Supabase (Advanced)

1. Start local Supabase:
   ```bash
   supabase start
   ```

2. Apply migrations:
   ```bash
   supabase db reset
   ```

3. Update `.env.local` to use local URLs:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```

## Testing Database Connection

Run this command to test your database setup:

```bash
npm run dev
```

Check the console for "✓ Database connection successful" message.

## Common Issues and Solutions

### 1. "Missing environment variables" error
- Ensure all required environment variables are set
- Check for typos in variable names
- Restart your development server after changes

### 2. RLS policies blocking queries
- Ensure user is properly authenticated
- Check that policies allow the specific operation
- Verify user roles are set correctly

### 3. Migration failures
- Run migrations in the correct order
- Check for conflicting table names
- Ensure you have proper permissions

### 4. Connection timeouts
- Check your Supabase project is active (not paused)
- Verify network connectivity
- Check region settings

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
DATABASE_URL=your_production_database_url
```

### Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key secured (not in client code)
- [ ] Proper CORS settings
- [ ] Rate limiting configured
- [ ] Backup policies in place

## Backup and Recovery

### Automated Backups

Supabase automatically backs up your database daily. You can:

1. Download backups from Dashboard → Settings → Database
2. Restore from a specific point in time
3. Set up custom backup schedules

### Manual Backup

```bash
# Backup schema and data
supabase db dump --data-only > backup.sql

# Restore from backup
psql -h your-host -p 5432 -U postgres -d postgres -f backup.sql
```

## API Usage Examples

### Creating an Office Space

```typescript
const { data, error } = await supabase
  .from('office_spaces')
  .insert({
    title: 'Modern Downtown Office',
    description: 'Beautiful office space...',
    location: {
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      coordinates: [-122.4194, 37.7749]
    },
    capacity: 10,
    pricing: {
      hourly: 25.00,
      daily: 180.00,
      weekly: 1100.00,
      monthly: 4200.00
    }
  });
```

### Querying with Filters

```typescript
const { data, error } = await supabase
  .from('office_spaces')
  .select('*')
  .eq('is_active', true)
  .gte('capacity', 5)
  .ilike('location->>city', '%San Francisco%')
  .range(0, 19);
```

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Join the [Supabase Discord](https://discord.supabase.com)

## Next Steps

After setting up the database:

1. Test the API endpoints
2. Set up authentication in your frontend
3. Configure file upload for images
4. Set up real-time subscriptions if needed
5. Add monitoring and analytics

---

**Important**: Never commit your `SUPABASE_SERVICE_ROLE_KEY` to version control. This key bypasses RLS and should only be used server-side.