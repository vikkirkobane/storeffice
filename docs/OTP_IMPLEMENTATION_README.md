# OTP Authentication with TurboSMTP Setup

This document explains the OTP (One-Time Password) authentication implementation using Supabase and TurboSMTP.

## Files Created

1. `supabase/functions/otp-auth/index.ts` - Deno Edge Function for OTP generation and verification
2. Updated environment variables in `.env` and `.env.local` files
3. `test-otp-functions.ts` - Test script for OTP functions

## How It Works

1. **OTP Generation**:
   - User provides email
   - Edge function generates a 6-digit OTP
   - OTP is stored in database with expiration time
   - OTP is sent to user's email via TurboSMTP

2. **OTP Verification**:
   - User provides email and OTP
   - Edge function verifies OTP against stored value
   - OTP is deleted after verification (one-time use)

## Database Functions

The following database functions are used (defined in `otp_database_functions.sql`):
- `create_otp(email, purpose)` - Creates and stores an OTP
- `verify_otp(email, purpose, otp)` - Verifies an OTP and removes it

## Environment Variables

Required environment variables for the OTP system:
- `SMTP_HOST` - SMTP server (e.g., smtp.turbosmtp.com)
- `SMTP_PORT` - SMTP port (e.g., 465)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FROM_EMAIL` - Sender email address
- `BRAND_NAME` - Brand name for emails
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Testing

Use the test script `test-otp-functions.ts` to test the OTP functions locally:
```bash
bun run test-otp-functions.ts
```

## Deployment

To deploy the OTP function to Supabase:
```bash
supabase functions deploy otp-auth --project-ref <your-project-ref>
```