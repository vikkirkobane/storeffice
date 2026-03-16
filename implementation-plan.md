# Storeffice - Implementation Plan

> Adapting the project to Next.js full-stack architecture with Drizzle ORM and better-auth

## Current State (March 15, 2026)
- ✅ Repository cloned and organized
- ✅ Landing page built (Hero, Features, Products Grid, Testimonials, FAQ, CTA)
- ✅ UI component library (Radix UI) installed and partially used
- ✅ Custom visual-editing component tagger configured
- ✅ Supabase PostgreSQL schema designed (32+ tables)
- ❌ Database connection not configured
- ❌ Authentication system not implemented
- ❌ Protected pages/dashboard not built
- ❌ API routes/server actions not created
- ❌ Core features (listings, bookings, products, cart) missing
- ❌ Stripe integration not set up
- ❌ File upload not configured
- ❌ Email/SMS services not integrated

## Architecture Decisions

### Stack
- **Frontend**: Next.js 15 (React 19), App Router, Server Components by default
- **Styling**: Tailwind CSS 4 + Radix UI + custom components
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM (type-safe, works well with Supabase)
- **Auth**: better-auth (modern, supports multiple providers, works with Drizzle)
- **Payments**: Stripe
- **File Storage**: Supabase Storage (or AWS S3)
- **Real-time**: Supabase Realtime (optional for Phase 2)
- **State**: Server state via server components + caching; client state via React context/Zustand if needed

### Database Strategy
- Use existing Supabase schema files in `/schema/`
- Convert to Drizzle schema in `src/lib/db/schema.ts`
- Use Drizzle's `drizzle-orm` and `drizzle-kit` for migrations
- Connection via DATABASE_URL in `.env`
- Leverage Supabase's PostGIS for geospatial queries, pg_trgm for text search

### Authentication Flow
- better-auth with Drizzle adapter
- Supports email/password + social (Google, Facebook, Apple)
- JWT tokens with refresh rotation (better-auth handles)
- Role-based access: customer, merchant, owner, admin
- Email verification required
- Phone OTP optional (can add later)

### API Strategy
- **Server Actions**: Primary method for mutations (create/update/delete) - keeps logic colocated with components, automatic type safety
- **REST API Routes**: For external integrations (Stripe webhooks, email triggers) and complex queries that need GET parameters
- **GraphQL**: Optional later if needed for complex frontend queries

### Caching & Performance (avoid rate limits)
- Next.js built-in caching (static generation where possible)
- Redis for:
  - Caching frequently accessed data ( listings, products)
  - Rate limiting (per IP, per user)
  - Session store (if needed)
  - Background job queue (Bull/Redis)
- Client-side: React Query (TanStack Query) for SWR patterns on protected data
- Pagination on all list endpoints (limit/offset or cursor-based)
- Debounced search to reduce API calls
- Optimistic UI updates

### Security
- Helmet (security headers) - configure in Next.js
- Rate limiting on API routes using Redis (upstash or similar)
- Input validation with Zod on all server actions/API
- CSRF protection (better-auth handles)
- SQL injection prevention (Drizzle parameterized queries)
- XSS prevention (React escaping)
- File upload validation (type, size, virus scan)
- PCI-DSS compliance via Stripe (no card data on our servers)

---

## Phase 1: Foundation (Months 1-2) - Sprint 0-2

### Week 1: Environment & Database Setup

- [ ] Create `.env.example` with all required env vars
- [ ] Add `dotenv` and configure
- [ ] Install Drizzle packages: `drizzle-orm`, `drizzle-kit`, `postgres`
- [ ] Create ` drizzle.config.ts`
- [ ] Convert Supabase schema to Drizzle schema (`src/lib/db/schema.ts`)
  - All tables: profiles, office_spaces, storage_spaces, bookings, storage_rentals, products, carts, orders, payments, reviews, favorites, etc.
  - Include relations, indexes, constraints
- [ ] Create `src/lib/db/index.ts` with Drizzle connection and exports
- [ ] Set up Drizzle migrations: `drizzle-kit generate` and `migrate`
- [ ] Create seed script with sample data (for development)
- [ ] Test database connection with simple query
- [ ] Add database connection health check endpoint

### Week 2: Authentication & Authorization

- [ ] Install better-auth and Drizzle adapter: `better-auth@latest`, `@better-auth/drizzle-adapter`
- [ ] Configure `src/lib/auth.ts` with:
  - Database adapter
  - Email/password credentials
  - Social providers (Google, Apple, Facebook) - need OAuth configs
  - Email verification requirement
  - Session cookie settings (httpOnly, secure, sameSite)
- [ ] Create auth pages:
  - `/login` (route: app/login/page.tsx)
  - `/register` (app/register/page.tsx)
  - `/forgot-password` (app/forgot-password/page.tsx)
  - `/reset-password` (app/reset-password/page.tsx)
  - `/verify-email` (app/verify-email/page.tsx)
- [ ] Create reusable auth form components using React Hook Form + Zod
- [ ] Implement protected route middleware (better-auth middleware)
- [ ] Create user role assignment on registration (default 'customer')
- [ ] Create admin user seeding script
- [ ] Test complete auth flow: register → verify email → login → logout

### Week 3: Core Layouts & UI Infrastructure

- [ ] Create application layout components:
  - `src/components/layouts/PublicLayout.tsx` (landing page layout)
  - `src/components/layouts/AuthLayout.tsx` (auth pages layout)
  - `src/components/layouts/DashboardLayout.tsx` (main app with sidebar/nav)
  - `src/components/layouts/AdminLayout.tsx` (admin panel)
- [ ] Build navigation components:
  - Header with user menu (avatar, dropdown for profile/logout)
  - Sidebar for dashboard (role-based menu items)
  - Breadcrumbs
- [ ] Create UI utility components:
  - DataTable (with sorting, filtering, pagination)
  - SearchBar (debounced)
  - ImageUploader (with preview, multiple images)
  - RatingStars component
  - LocationPicker (Google Maps integration)
  - DateRangePicker (for bookings)
  - NotificationBell with dropdown
- [ ] Implement theme system (light/dark mode) if needed
- [ ] Create loading skeletons and error boundaries
- [ ] Set up global error handling (toast notifications with sonner)

### Week 4: User Profiles & Dashboard

- [ ] Create user profile pages:
  - `/dashboard/profile` (view and edit profile)
  - `/dashboard/settings` (account settings, password change, notifications)
  - `/dashboard/verification` (business verification docs upload for merchants/owners)
- [ ] Implement profile photo upload with image optimization
- [ ] Implement avatar display (using profile_photo or initials)
- [ ] Create dashboard home page (`/dashboard`) showing:
  - For customers: recent bookings, saved items, recommendations
  - For merchants: storage rental status, product stats, recent orders
  - For owners: office space performance, upcoming bookings, earnings
  - For admin: platform metrics, flagged content, recent disputes
- [ ] Create user settings page (email preferences, 2FA setup)
- [ ] Implement account deletion (soft delete)

---

## Phase 2: Core Features (Months 3-4) - Sprint 3-6

### Office Space Listings (for Owners)

- [ ] Server actions for CRUD operations:
  - `createOfficeSpace( data)`
  - `updateOfficeSpace(id, data)`
  - `deleteOfficeSpace(id)`
  - `getOfficeSpace(id)`
  - `listOfficeSpaces(filters, pagination)`
- [ ] Office space listing page (`/spaces/office`):
  - Filters: location (map-based), date range, capacity, amenities, price range
  - Grid/list view toggle
  - Sorting: relevance, price, rating, newest
  - Pagination (20 per page)
  - Search with autocomplete (use pg_trgm index)
- [ ] Office space detail page (`/spaces/office/[id]`):
  - Photo gallery (with zoom, thumbnails)
  - Amenities list
  - Pricing calendar (show availability)
  - Book now CTA (if logged in as customer)
  - Owner info (with verification badge)
  - Reviews section
  - Virtual tour embed (if available)
- [ ] Create/Edit/Delete pages for owners:
  - `/dashboard/office-spaces/new`
  - `/dashboard/office-spaces/[id]/edit`
  - Multi-step form with image upload (max 10 photos)
  - Use react-hook-form + zod validation
  - Location input with Google Maps Places autocomplete
  - Amenities multi-select with chips
  - Pricing matrix (hourly/daily/weekly/monthly)
- [ ] Implement availability calendar management (block dates, set advance booking)
- [ ] Owner dashboard section to manage bookings (approve/decline)
- [ ] QR code generation for check-in (use `qrcode` library)

### Booking System

- [ ] Booking server actions:
  - `createBooking(spaceId, dates, guestCount, specialRequests)`
  - `getBooking(id)`
  - `listBookings(filters)`
  - `cancelBooking(id, reason)`
  - `checkInBooking(id, method)`
  - `checkOutBooking(id)`
- [ ] Booking flow on office space detail page:
  - Date picker for check-in/check-out
  - Guest count selector
  - Price calculation with fees/taxes (real-time update)
  - Payment integration (Stripe Checkout or PaymentIntent)
  - Booking confirmation page
- [ ] Customer bookings page (`/dashboard/bookings`):
  - Tabs: upcoming, past, cancelled
  - Cancel booking (with refund policy display)
  - View details, check-in instructions, QR code
  - Leave review after completion
- [ ] Owner bookings management:
  - View incoming requests
  - Approve/decline with note
  - Check-in/out manually if QR fails
- [ ] Email notifications for booking events (sendgrid)
- [ ] SMS reminders (Twilio) - optional

### Storage Spaces (for Merchants & Owners)

- [ ] Storage CRUD server actions (similar to office spaces)
- [ ] Storage listing page (`/spaces/storage`):
  - Filters: location, storage type, size, price, features (climate control, 24/7 access)
  - Map view optional
- [ ] Storage detail page (`/spaces/storage/[id]`):
  - Photos, dimensions, features
  - Rental pricing (monthly/annual)
  - "Rent Now" CTA → rental agreement flow
- [ ] Merchant rental flow:
  - Select storage space
  - Choose rental term (months)
  - Sign rental agreement (terms & conditions)
  - Payment (Stripe subscription or one-time)
  - Access code/key info after payment
- [ ] Merchant dashboard storage section:
  - Active rentals (with end date, next payment)
  - Storage units inventory by location
  - Add new products linked to storage
- [ ] Owner storage management (similar to office spaces)

### Product Marketplace

- [ ] Product CRUD server actions (create, update, delete, list)
- [ ] Product listing page (`/products`):
  - Filters: category, price range, location (nearby), rating
  - Search by keyword (use tsvector or Elasticsearch? For now use pg_trgm)
  - Sorting: price, popularity, rating, newest
- [ ] Product detail page (`/products/[id]`):
  - Image gallery (multiple views)
  - Price, compare-at price, discount badge
  - Inventory status (in stock, low stock, out of stock)
  - Add to cart button (if logged in)
  - Merchant info (with link to their storefront)
  - Reviews and ratings
  - Related products
- [ ] Merchant product management pages:
  - `/dashboard/products/new`
  - `/dashboard/products/[id]/edit`
  - Bulk import (CSV) - optional later
  - Inventory tracking and low-stock alerts
- [ ] Shopping cart:
  - Cart state (persisted to localStorage for guests, to DB for logged-in)
  - Add/remove items, quantity updates
  - Cart summary (subtotal, taxes, shipping)
  - Guest checkout vs logged-in checkout
- [ ] Checkout flow:
  - Address form (shipping/billing)
  - Stripe payment form (Elements or Checkout)
  - Order confirmation page
  - Email receipt
- [ ] Order management:
  - Customer orders page (`/dashboard/orders`)
  - Merchant orders page (orders for their products)
  - Admin order view
  - Order status updates (processing, shipped, delivered)
  - Tracking number integration

### Reviews & Ratings

- [ ] Review CRUD server actions
- [ ] Customers can review:
  - Completed office space bookings
  - Completed product orders
  - Storage rentals (after 1 month?)
- [ ] Rating calculation: average, weighted by recency
- [ ] Review listing: sort by helpful, recent, high/low rating
- [ ] Helpful vote system
- [ ] Flag inappropriate reviews
- [ ] Owner/merchant responses to reviews (optional)

---

## Week 8: Payments with Stripe

- [ ] Install Stripe SDK: `stripe`
- [ ] Create Stripe account and get publishable/secret keys
- [ ] Configure Stripe in `.env`
- [ ] Create payment server actions:
  - `createPaymentIntent(amount, currency, metadata)` for bookings/orders
  - `confirmPayment(paymentIntentId)` (or use Stripe webhooks)
  - `createCheckoutSession(cartItems, successUrl, cancelUrl)` for cart
  - `handleStripeWebhook(event)` (API route to handle Stripe events)
- [ ] Implement payment flow:
  - For bookings: authorize at booking time, capture at check-in or after cancellation period
  - For products: immediate payment, capture
  - For storage rentals: recurring subscription (Stripe Subscription)
- [ ] Payment success/failure pages
- [ ] Order/payment history in dashboard
- [ ] Refund processing via Stripe
- [ ] Test with Stripe test mode
- [ ] PCI compliance: ensure no card data touches our server

---

## Week 9: File Uploads & Media

- [ ] Set up Supabase Storage bucket (or AWS S3)
- [ ] Configure storage credentials in `.env`
- [ ] Create file upload server action:
  - Validate file type (images: jpg, png, webp; documents: pdf)
  - Validate file size (max 10MB)
  - Generate unique filename (UUID)
  - Upload to storage
  - Return public URL
  - For images: generate thumbnails (using sharp)
- [ ] Modify listing/product forms to use uploader
- [ ] Display uploaded images with lazy loading and Next.js Image optimization
- [ ] Implement image deletion (when user removes)
- [ ] Add CDN caching headers (Supabase handles)

---

## Week 10: Search & Discovery

- [ ] Optimize database queries:
  - Add indexes: location (GIST), text search (GIN on tsvector or trigram), foreign keys
  - Use prepared statements (Drizzle does automatically)
- [ ] Implement search API (server action or API route):
  - Full-text search on title, description, using `to_tsquery` or `ilike` with pg_trgm
  - Filters: location (radius query with PostGIS), price range, capacity, etc.
  - Faceted search: count by category, amenities
  - Sort options
  - Pagination (cursor-based for performance)
- [ ] Add debounced search input (300ms) to listing pages
- [ ] Implement "Near me" search using user's location (browser geolocation)
- [ ] Cache frequent search results in Redis (5 min TTL)
- [ ] Create search analytics (popular queries, zero-result queries)

---

## Week 11: Notifications & Messaging

- [ ] Notification system:
  - Store notifications in DB table (notifications)
  - Types: booking request, booking confirmed, payment received, review posted, message received
  - Real-time via WebSocket or polling (polling simpler: every 30s)
- [ ] In-app notification bell (with badge count)
- [ ] Notification preferences in user settings
- [ ] Email notifications (sendgrid templates) for key events
- [ ] SMS notifications (Twilio) for time-sensitive alerts (booking reminders)
- [ ] Push notifications (FCM) for mobile app (Phase 3)
- [ ] Simple messaging between users (buyer-seller, owner-tenant):
  - Create messages table
  - Threaded conversations
  - Real-time updates

---

## Week 12: Admin Panel

- [ ] Admin-only routes (middleware to check role === 'admin')
- [ ] Admin dashboard overview:
  - Total users, listings, bookings, revenue (card metrics)
  - Charts: user growth, booking trends, revenue over time (use recharts)
  - Recent activities log
- [ ] User management:
  - List users with filters (role, status, verified)
  - View user profile
  - Suspend/activate user
  - Impersonate user (dev only) optional
- [ ] Listing moderation:
  - Pending verifications (office/storage spaces requiring review)
  - Flagged listings (reported by users)
  - Approve/reject with reason
- [ ] Review moderation:
  - Flagged reviews
  - Remove inappropriate content
- [ ] Transaction oversight:
  - All transactions list with filters (status, date range)
  - Refund processing
  - Dispute resolution interface
- [ ] Platform settings (admin only):
  - Update site name, logo, contact info
  - Configure commission rates (for future)
  - Manage static content pages (terms, privacy, FAQ)

---

## Phase 3: Polish & Advanced Features (Month 5+)

### Performance Optimization

- [ ] Implement Redis caching for:
  - Popular listings (top 100) - 5 min TTL
  - Product category listings - 2 min TTL
  - Search results for common queries - 1 min TTL
- [ ] Use Next.js `unstable_cache` for server component data fetching
- [ ] Set up SWR/React Query for client-side data (dashboard lists)
- [ ] Enable incremental static regeneration (ISR) for static pages (home, help pages)
- [ ] Optimize images with Next.js Image (auto WebP, responsive sizes)
- [ ] Code splitting and lazy loading for heavy components (maps, charts)
- [ ] Bundle analysis: check with `@next/bundle-analyzer`
- [ ] Database query optimization: ensure all queries use indexes; use EXPLAIN ANALYZE
- [ ] Implement rate limiting on API routes (upstash Redis, or simple limiter)

### Monitoring & Observability

- [ ] Set up Sentry for error tracking
- [ ] Set up LogRocket or similar for session replay
- [ ] Structured logging with Pino (if needed)
- [ ] Performance monitoring (Next.js Analytics, or custom)
- [ ] Database connection pool monitoring (PgBouncer?)

### Testing

- [ ] Unit tests for utilities, helper functions
- [ ] Component tests with React Testing Library
- [ ] Integration tests for API routes (using Supertest)
- [ ] E2E tests with Playwright (critical user flows: booking, checkout)
- [ ] Achieve >80% test coverage
- [ ] CI: run tests on every PR

### CI/CD

- [ ] GitHub Actions workflows:
  - Lint on PR
  - Test on PR
  - Build on PR
  - Deploy to staging on merge to main
  - Deploy to production on tag (manual approval)
- [ ] Dockerfile for container deployment (optional if using Vercel)
- [ ] Environment management: .env.local for secrets, .env.production for production
- [ ] Database migration automation (drizzle-kit migrate in CI before deploy)

### Legal & Compliance

- [ ] Create Terms of Service page
- [ ] Create Privacy Policy page (GDPR, CCPA compliant)
- [ ] Cookie consent banner (if needed)
- [ ] Age verification (if required)
- [ ] Implement data deletion endpoint (right to be forgotten)
- [ ] Data export endpoint (GDPR access rights)
- [ ] Add reCAPTCHA v3 to registration to prevent bots

### Accessibility

- [ ] Audit with Lighthouse (accessibility score >90)
- [ ] Ensure proper ARIA labels on interactive elements
- [ ] Keyboard navigation throughout
- [ ] Color contrast compliance
- [ ] Screen reader testing
- [ ] Focus management for modals and dialogs

### Localization & Internationalization

- [ ] Set up next-intl or similar for i18n
- [ ] Extract strings to JSON files
- [ ] Implement language switcher
- [ ] Format dates, currencies, numbers per locale
- [ ] RTL support if needed (Arabic, Hebrew) - probably not for now

---

## Phase 4: Launch Preparation (Month 6)

### Data Seeding & Launch Content

- [ ] Seed database with:
  - Admin users (1-2)
  - Sample office spaces (5-10)
  - Sample storage spaces (5-10)
  - Sample products (20-30)
  - Sample users (10-20)
  - Sample bookings, orders, reviews
- [ ] Create initial blog/help content (optional)
- [ ] Prepare marketing landing page copy (already done)

### Soft Launch

- [ ] Deploy to staging environment
- [ ] Internal QA testing
- [ ] Fix bugs from testing
- [ ] Performance testing (load test with k6 or similar)
- [ ] Security audit (run OWASP ZAP, fix vulnerabilities)
- [ ] Deploy to production (limited region)
- [ ] Invite beta users (family/friends/early access)
- [ ] Collect feedback, fix critical issues

### Full Launch

- [ ] Scale infrastructure (autoscaling, read replicas)
- [ ] Set up proper monitoring alerts (Sentry, Datadog, etc.)
- [ ] Marketing campaigns
- [ ] Customer support onboarding
- [ ] Legal documents finalization
- [ ] App store submissions (iOS/Android) - if mobile app ready

---

## Milestones & Deliverables

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| Database & Auth | Week 2 | Working auth flow, protected routes |
| Core Layouts & UI | Week 4 | Dashboard, UI components themable |
| Office Listings | Week 6 | Owners can create/manage listings, customers can browse/book |
| Booking System | Week 7 | Complete booking flow with payments |
| Storage & Products | Week 9 | Merchants can list products, customers can buy |
| Payments Complete | Week 10 | Stripe integrated for all payment types |
| Admin Panel | Week 12 | Full admin features |
| MVP Ready | Week 12 | All core features functional, ready for beta |
| Polished MVP | Week 14 | Optimized, tested, with monitoring |
| Soft Launch | Week 16 | Staging deployed, beta users invited |
| Public Launch | Week 20 | Full production launch |

---

## Technical Debt & Future

- Mobile app (React Native) - separate repo, share API
- Microservices split if needed (auth service, payments service, notifications service)
- AI features: product recommendations, dynamic pricing, fraud detection
- Advanced analytics: predictive models
- Blockchain for smart contracts (optional)

---

*Last updated: 2026-03-15 (Implementation started)*
