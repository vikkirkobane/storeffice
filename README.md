# Storeffice

**Office Space Booking & Product Marketplace Platform**

Storeffice is a dual-purpose marketplace that enables users to book office spaces and rent shelf/storage spaces for product inventory. It combines the booking model of Airbnb with the marketplace model of Alibaba/Amazon, creating a unified ecosystem where office owners monetize spaces, merchants advertise and store products, and customers discover goods.

---

## 📊 Executive Summary (Investors)

### Problem
- Underutilized office and storage spaces represent lost revenue for property owners.
- Small merchants struggle to find affordable, flexible storage with built-in visibility.
- Customers lack a single platform to discover both workspaces and products.

### Solution
Storeffice connects three user types on one platform:
- **Owners** list office/storage spaces with dynamic pricing and calendar management.
- **Merchants** rent storage, list products, and reach local customers.
- **Customers** book offices and shop products with integrated payments.

### Market Opportunity
- Global coworking market: \$13B+ (2025) → \$37B (2030)
- Self-storage market: \$120B+ (US alone)
- East Africa commercial real estate digitization accelerating

### Business Model
- Booking commissions (10–15%)
- Monthly storage rental fees
- Product listing fees and transaction charges
- Premium features (analytics, promotions)

### Traction & Roadmap
- **Q2 2026**: MVP launch (web) with core booking + marketplace
- **Q3 2026**: Mobile app (React Native)
- **Q4 2026**: Stripe payments, email/SMS notifications, real-time chat
- **2027**: Expansion to 5 metropolitan areas in Africa & US

### Team
Victor Chogo — Full-Stack & AI Engineer with 5+ years in cloud-native applications, fintech, and enterprise security. Built AI-powered platforms, blockchain dApps, and distributed monitoring systems.

---

## 🛠 Technology Stack (Developers)

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **UI Components** | Radix UI, Headless UI, Framer Motion |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM (type-safe queries) |
| **Authentication** | better-auth with Drizzle adapter (JWT + sessions) |
| **Payments** | Stripe (to be integrated) |
| **Maps** | Leaflet + React-Leaflet |
| **3D** | Three.js, React Three Fiber, 3D Globe |
| **File Storage** | Supabase Storage / AWS S3 |
| **Testing** | Jest (unit), Playwright (E2E) |
| **DevOps** | Docker, GitHub Actions, Vercel (deployment target) |

---

## 📁 Project Structure

```
storeffice/
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Local PostgreSQL dev environment
├── drizzle.config.ts            # Drizzle configuration
├── drizzle/                     # Generated migrations (SQL files)
│   ├── meta/
│   └── *.sql
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.mjs          # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── public/                      # Static assets (images, favicon, etc.)
│
├── src/
│   ├── app/                     # Next.js App Router (pages + layout)
│   │   ├── (auth)/              # Authentication pages (login, register)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── check-email/page.tsx
│   │   ├── (dashboard)/         # Protected dashboard pages
│   │   │   ├── layout.tsx       # Dashboard shell (nav + sidebar)
│   │   │   ├── page.tsx         # Dashboard home
│   │   │   ├── spaces/page.tsx  # Office spaces management
│   │   │   └── storage/page.tsx # Storage spaces management
│   │   ├── api/
│   │   │   ├── auth/[...better-auth]/route.ts  # better-auth handler
│   │   │   ├── dashboard/spaces/route.ts        # List spaces (GET)
│   │   │   ├── api/dashboard/storage/route.ts
│   │   │   └── health/route.ts  # Health check endpoint
│   │   ├── layout.tsx           # Root layout (public)
│   │   ├── page.tsx             # Homepage (marketing)
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # Reusable React components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-nav.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── office-spaces-list.tsx
│   │   │   ├── new-office-space-button.tsx
│   │   │   ├── storage-spaces-list.tsx
│   │   │   └── new-storage-space-button.tsx
│   │   ├── sections/            # Marketing page sections (Hero, Features, etc.)
│   │   └── ui/                  # Generic UI primitives (buttons, cards, etc.)
│   │
│   ├── lib/                     # Core libraries & utilities
│   │   ├── db/
│   │   │   ├── index.ts         # Drizzle connection (db instance)
│   │   │   └── schema.ts        # Complete PostgreSQL schema (Drizzle)
│   │   ├── actions/             # Server Actions (mutations)
│   │   │   ├── office-spaces.ts
│   │   │   └── storage-spaces.ts
│   │   └── auth.ts              # better-auth configuration
│   │
│   ├── middleware.ts            # Next.js middleware (route protection)
│   └── types/                   # TypeScript type definitions (if needed)
│
├── docs/                        # Additional documentation
│   ├── API.md                   # API reference (to be generated)
│   ├── Schema.md                # Database ER diagram (to be generated)
│   └── Deployment.md            # Deployment guides
│
├── schema/                      # Original Supabase schema files (reference)
│   ├── schema.sql
│   ├── supabase_schema.sql
│   └── ...
│
└── __tests__/                   # Test files (unit & integration)
```

### Key Conventions

- **App Router**: All pages live under `src/app/`. Group routes with parentheses `(auth)` for layout grouping without affecting URL.
- **Server Components by default**: Use `"use client"` directive only when interactivity (state, effects) is needed.
- **Server Actions**: Mutations are defined in `src/lib/actions/` and called from client components. This keeps API surface minimal and enforces server-side validation.
- **Drizzle ORM**: Schema defined in `src/lib/db/schema.ts`. All tables, relations, and indexes are in one place. Use `db.insert/update/select` in server actions or API routes.
- **Authentication**: better-auth manages sessions via cookies. The `auth` object from `src/lib/auth.ts` is used in server components to get the current user (`await auth.getSession()`).
- **Styling**: Tailwind CSS v4 with utility‑first classes. Radix UI provides accessible primitives (dialog, dropdown, etc.).
- **Environment**: All secrets in `.env` (never committed). Copy `.env.example` and fill values.

---

## 🗄 Database Schema

The platform uses a comprehensive PostgreSQL schema with 30+ tables. Key entities:
- List spaces with photos, amenities, capacity, pricing (hourly/daily/weekly/monthly)
- Real-time calendar and availability management
- Booking requests with approval workflow
- Reviews and ratings

### For Merchants
- Browse and rent storage spaces by size, location, features
- Product catalog with images, inventory, SKU
- Built-in advertising to local customers
- Order management and analytics

### For Customers
- Search office spaces by location, price, amenities
- Book instantly or request booking
- Discover merchant products in the same ecosystem
- Secure checkout with reviews

### Platform-Wide
- Role-based access (customer, owner, merchant, admin)
- Email verification and password reset
- Responsive design (mobile-first)
- RESTful API with JSON:API-style responses
- Comprehensive Drizzle schema (32+ tables)
- Real-time notifications (planned)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Supabase)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/vikkirkobane/storeffice.git
cd storeffice
npm ci
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — PostgreSQL connection (see below for options)
- `AUTH_SECRET` — a random 64+ char string (`openssl rand -hex 32`)
- `AUTH_TRUSTED_ORIGINS` — e.g., `http://localhost:3000`
- Optional: `SENDGRID_API_KEY`, `STRIPE_SECRET_KEY`, etc.

#### Database options

**Local with Docker:**
```bash
docker-compose up -d
DATABASE_URL=postgresql://postgres:storeffice123@localhost:5432/storeffice
```

**Supabase Cloud (free tier):**
1. Create a project at https://supabase.com
2. In Settings → Database, get the connection string
3. Set `DATABASE_URL` to that value

### 3. Apply Database Schema
```bash
npm run db:push
```

This will create all tables defined in `src/lib/db/schema.ts`.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Access the App
- Home page: `/`
- Login: `/login`
- Register: `/register`
- Dashboard: `/dashboard` (protected)

---

## 🗄 Database Schema

The platform uses a comprehensive PostgreSQL schema with 30+ tables. Key entities:

| Table | Description |
|-------|-------------|
| `profiles` | User accounts (extends auth) |
| `office_spaces` | Office space listings |
| `storage_spaces` | Storage/shelf space listings |
| `products` | Merchant product catalog |
| `bookings` | Office space reservations |
| `storage_rentals` | Storage rental contracts |
| `carts` | Shopping cart items |
| `orders` | Purchase orders |
| `payments` | Payment transactions |
| `reviews` | Ratings and reviews |
| `favorites` | Saved spaces/products |
| `messages` | User-to-user messaging |
| `notifications` | In-app notifications |

Full ER diagram: see `docs/Schema.md` (to be generated).

---

## 🔐 Authentication & Authorization

Storeffice uses **better-auth** with a Drizzle adapter for PostgreSQL.

- **Credentials**: Email + password with bcrypt hashing
- **Social logins**: Google, Apple, Facebook (configurable)
- **Email verification**: Required (via SendGrid)
- **Password reset**: Built-in flow
- **Sessions**: HTTP-only cookies, 7-day expiration

User types (`profiles.user_type`):
- `customer` – browse and book
- `owner` – manage listed spaces
- `merchant` – storage + products
- `admin` – platform oversight

---

## 📡 API Reference

### Public Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check (DB status) |
| `GET` | `/api/spaces` | List active office spaces (public) |
| `GET` | `/api/products` | List active products (public) |

### Authenticated (via better-auth)
All `/dashboard/*` pages and API routes require a valid session.

Server actions (called from components) manage mutations securely.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 📦 Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly to DB (dev) |
| `npm run db:studio` | Open Drizzle Studio GUI |
| `npm run test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## 🚢 Deployment

### Recommended: Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (Supabase, Stripe, etc.)
4. Deploy

### Additional: Supabase
- Set up a Supabase project and attach it in Vercel integrations
- Run `npm run db:push` on first deploy (via Vercel build hook or manually)

### PostgreSQL Migrations in Production
We use `drizzle-kit push` for schema sync. For production with complex migrations, consider:
- Generate SQL migrations: `npm run db:generate`
- Review `drizzle/*.sql` files
- Apply via `npm run db:migrate` (or manual psql)

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m "Add amazing feature"`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code passes linting (`npm run lint`)
- Tests added for new features
- Commits follow conventional commits (feat, fix, chore, etc.)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

## 📞 Contact & Support

- **Website**: (coming soon)
- **GitHub Issues**: https://github.com/vikkirkobane/storeffice/issues
- **Email**: hello@storeffice.com

---

## 🙏 Acknowledgments

Built with ❤️ by Victor Chogo and the Storeffice team.

Powered by open-source: Next.js, Drizzle, better-auth, Tailwind, Radix UI, and many others.

---

## 🔮 Future Roadmap

- [ ] Stripe payments integration
- [ ] File uploads for space/product images (Supabase Storage)
- [ ] Email notifications (SendGrid)
- [ ] Real-time chat between owners/merchants/customers
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters and geolocation
- [ ] Admin dashboard with analytics
- [ ] Multi-language support
- [ ] AI-powered recommendations (next to Clarity integration!)

---

*Last updated: March 2026*
