# Storeffice Project Notes

## Overview
Storeffice is a dual-purpose marketplace platform for office space booking and product storage. It's a hybrid of Airbnb's booking model and Alibaba/Amazon's marketplace.

**Technology Stack (Actual):**
- Frontend: Next.js 15 (React 19), App Router, Tailwind CSS 4, Radix UI
- Backend: Next.js API Routes, Server Actions (in progress)
- Database: PostgreSQL (Supabase) with Drizzle ORM
- Authentication: JWT with bcrypt (custom implementation)
- Payments: Stripe (to be integrated)
- File Storage: Supabase Storage / AWS S3 (to be configured)
- Package Manager: npm

**Note:** The original tasks.md assumes a separate Node/Express backend. We are adapting to a full-stack Next.js architecture for faster development and better integration.

## Repository
`https://github.com/vikkirkobane/storeffice.git`

## Project Status
**Current Phase:** Foundation - Authentication & Database Setup  
**Target Launch:** Q2 2026

**Completed:**
- ✅ Repository setup with Git
- ✅ PostgreSQL schema designed (adapted from Supabase)
- ✅ Drizzle ORM integration and schema definitions
- ✅ Custom JWT authentication (register/login/logout/refresh/session)
- ✅ API routes for authentication
- ✅ Protected dashboard layout
- ✅ Landing page (marketing) with UI components
- ✅ Login & registration pages with form validation

**In Progress:**
- 🔄 Database migration setup (drizzle-kit)
- 🔄 UI components for core features (office spaces, storage, products)
- 🔄 Server actions for CRUD operations
- 🔄 Stripe payments integration
- 🔄 File upload handling

**Next Milestones:**
- Apply database migrations to create tables
- Test complete auth flow (register → verify email → login → dashboard)
- Build office space listing & management (CRUD)
- Build booking system with calendar
- Build product marketplace with cart & checkout

## Key Documents
- `README.md` - Full project overview, business model, roadmap
- `tasks.md` - Comprehensive development tasks organized by sprints
- `prd.md` - Product requirements document
- `planning.md` - Detailed planning and architecture notes
- `claude.md` - Claude-specific project context

## Quick Start for Development
1. Prerequisites: Node.js 18+, PostgreSQL (Supabase recommended)
2. Clone and install: `npm install`
3. Set up environment: `cp .env.example .env` and configure DATABASE_URL, AUTH_SECRET, etc.
4. Set up database: run `npx drizzle-kit migrate` (after configuring DATABASE_URL)
5. Start dev server: `npm run dev`
6. Open http://localhost:3000
7. Access login/register at `/login`, `/register`

## Next Immediate Tasks (from Phase 0)
- [ ] Review project charter and success criteria
- [ ] Set up project management tools (Jira/Linear/Trello)
- [ ] Create initial backlog from tasks.md
- [ ] Define team roles and responsibilities
- [ ] Set up design system in Figma
- [ ] Create wireframes for key screens
- [ ] Design database schema (ER diagram)
- [ ] Create API specification (OpenAPI)

## Success Metrics
- 10,000 active users within 12 months post-launch
- 99.9% uptime, <2 second load times
- <3 minute average transaction time
- Presence in 5 major metropolitan areas within 18 months
- $10M+ revenue by Year 3

---

*Last updated: 2026-03-14 (Project initialized)*
