# Deployment & Runbook

This guide covers deploying Storeffice to production (Vercel recommended) and operating the live system.

---

## Prerequisites

- Supabase project (PostgreSQL database)
- Vercel account (or alternative: Railway, AWS, GCP)
- Domain name (e.g., storeffice.com)
- Stripe account (for payments)
- SendGrid account (for emails)
- Upstash Redis (optional, for cache and rate limiting persistence)

---

## Environment Configuration

Set the following environment variables in your hosting platform:

### Required
```
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
AUTH_SECRET=<32+ random bytes hex>
AUTH_TRUSTED_ORIGINS=https://yourdomain.com
```

### Payments
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email
```
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@storeffice.com
SENDGRID_FROM_NAME=Storeffice
```

### Optional (Redis/cache)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### App URL
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=... (if using address autocomplete)
```

---

## Deploy to Vercel

1. Connect GitHub repository to Vercel.
2. Select framework: Next.js.
3. Add all environment variables above in Vercel project settings.
4. Build command: `next build` (default).
5. Output directory: `.next` (default).
6. Click Deploy.

After deploy, set custom domain in Vercel → Domains, and configure DNS accordingly.

---

## Database Migrations

Storeffice uses Drizzle ORM. On first deploy:

```bash
# Generate migration files (if not already)
npm run db:generate

# Apply migrations to production database
npm run db:migrate
```

Alternatively, use `npm run db:push` to sync schema directly (use with caution in production).

---

## Stripe Webhook Setup

1. In Stripe Dashboard → Developers → Webhooks, add endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
2. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
3. Test webhook in Stripe test mode before going live.

---

## SendGrid Setup

1. Create a SendGrid account and verify sender identity.
2. Generate an API key with "Mail Send" permissions.
3. Set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`.
4. For production, configure dedicated IP and domain authentication if needed.

---

## Monitoring & Alerts

- **Vercel Analytics**: built-in performance and error tracking.
- **Sentry** (recommended): set up Sentry Next.js SDK for error aggregation.
- **Uptime monitoring**: use UptimeRobot or similar to ping `/api/health` (create a simple health endpoint returning `{ status: "ok" }`).
- **Database monitoring**: check Supabase dashboard for slow queries and connection limits.

---

## Common Operational Tasks

### View logs
- Vercel: `vercel logs <project> --since 1h`
- Or use Vercel dashboard.

### Rollback
- Vercel: promote previous deployment from the dashboard.

### Run a one-off script (e.g., data migration)
- Vercel: use Vercel CLI `vercel env pull .env.local` then run locally, or use a one-off job in an external worker.

### Reset rate limit counters
- Redis: flush affected keys if using Redis; otherwise restart server to clear in-memory counts.

### Database backup
- Supabase: enable automatic backups or export manually.

---

## Security Checklist

- [ ] All auth secrets are strong and stored in env vars.
- [ ] CSP headers configured (already in next.config.ts).
- [ ] Rate limiting active (middleware).
- [ ] SSL/TLS enforced (Vercel provides automatically).
- [ ] Admin routes protected by role checks.
- [ ] Payment webhook signature verification enabled.
- [ ] Database connection uses SSL (`sslmode=require`).

---

## Performance Tips

- Enable Upstash Redis to share rate limit state across instances and cache expensive queries.
- Add Redis caching for:
  - Public product/space listings (cache key by filter)
  - Dashboard stats (short TTL, e.g., 5 min)
- Optimize images: ensure all images use `next/image` with proper `width`/`height` or `fill`.
- Consider database connection pooling (PgBouncer) if connection errors occur under load.

---

## Support Contacts

- Stripe Support: https://support.stripe.com
- SendGrid Support: https://support.sendgrid.com
- Supabase Support: https://supabase.com/docs/support

---

*Keep this runbook updated as the system evolves.*
