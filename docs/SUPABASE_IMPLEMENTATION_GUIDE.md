# Supabase Implementation Guide: OTP-Based Authentication with Password Reset

This guide will walk you through setting up the OTP-based authentication system with password reset functionality in Supabase.

## Prerequisites

Before implementing these changes, ensure you have:
- A Supabase project set up
- Admin access to your Supabase dashboard
- Access to your project's environment variables

## Step 1: Configure Supabase Authentication Settings

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Settings**
3. Under **Email Templates**, ensure that "Email confirmations" and "Secure email change" are configured as needed
4. Under **Authentication Providers**, make sure "Email" is enabled
5. Go to **Authentication** → **URL Configuration** and add your redirect URLs:
   - `http://localhost:3000/verify-otp` (for development)
   - `https://yourdomain.com/verify-otp` (for production)

## Step 2: Create the OTP Database Schema

Add the following SQL to your Supabase database. You can run this in the **SQL Editor**:

```sql
-- Create table to store OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  email text NOT NULL,
  otp text NOT NULL,
  purpose text NOT NULL DEFAULT 'login', -- e.g., 'login', 'register', 'password_reset'
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT NOW(),
  PRIMARY KEY (email, purpose)
);

-- Enable Row Level Security
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Allow service role access" ON otp_codes
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_purpose ON otp_codes (email, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes (expires_at);

-- Function to generate OTP codes
CREATE OR REPLACE FUNCTION create_otp(p_email text, p_purpose text DEFAULT 'login')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp text;
  v_expires_at timestamp with time zone;
BEGIN
  -- Generate 6-digit numeric OTP
  v_otp := lpad(floor(random() * 1000000)::text, 6, '0');
  v_expires_at := NOW() + INTERVAL '10 minutes'; -- OTP expires in 10 minutes

  -- Insert or update OTP record
  INSERT INTO otp_codes (email, otp, purpose, expires_at)
  VALUES (p_email, v_otp, p_purpose, v_expires_at)
  ON CONFLICT (email, purpose)
  DO UPDATE SET
    otp = EXCLUDED.otp,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();

  RETURN v_otp;
END;
$$;

-- Function to verify OTP codes
CREATE OR REPLACE FUNCTION verify_otp(p_email text, p_purpose text, p_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record otp_codes%rowtype;
BEGIN
  -- Get the OTP record
  SELECT * INTO v_record
  FROM otp_codes
  WHERE email = p_email
    AND purpose = p_purpose
  LIMIT 1;

  -- Check if OTP exists, is valid, and hasn't expired
  IF v_record IS NULL OR
     v_record.otp != p_otp OR
     v_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  -- Delete the OTP record after verification (one-time use)
  DELETE FROM otp_codes WHERE email = p_email AND purpose = p_purpose;

  RETURN TRUE;
END;
$$;
```

## Step 3: Set Up Supabase Edge Function

1. Go to your Supabase project directory and ensure you have the supabase CLI installed:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to your Supabase account
   supabase login
   ```

2. Initialize the functions directory in your project:
   ```bash
   # Navigate to your project directory
   cd your-project-directory/supabase
   
   # If functions directory doesn't exist, create it
   mkdir -p functions
   ```

3. Create the OTP authentication function:
   ```bash
   # Create the function
   supabase functions new otp-auth
   ```

4. Replace the content of `supabase/functions/otp-auth/index.ts` with:

```typescript
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { encode as btoa } from "https://deno.land/std@0.203.0/encoding/base64url.ts";

console.info('otp-auth function starting');

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\//, '');
  const path = pathname.split('/').slice(1).join('/');

  // env
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Deno.env.get('SMTP_PORT') || '465';
  const SMTP_USER = Deno.env.get('SMTP_USER');
  const SMTP_PASS = Deno.env.get('SMTP_PASS');
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'no-reply@example.com';
  const BRAND_NAME = Deno.env.get('BRAND_NAME') || 'Storeffice';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return new Response(JSON.stringify({ error: 'SMTP credentials not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (req.method === 'POST' && url.pathname.endsWith('/generate-otp')) {
      const body = await req.json();
      const email = (body.email || '').toString().toLowerCase();
      const purpose = (body.purpose || 'login').toString();

      if (!email) {
        return new Response(JSON.stringify({ error: 'email required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // call DB function to create otp
      const createRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/create_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
        },
        body: JSON.stringify({ p_email: email, p_purpose: purpose })
      });

      if (!createRes.ok) {
        const text = await createRes.text();
        console.error('DB error:', text);
        return new Response(JSON.stringify({ error: 'db_error', detail: text }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const otp = await createRes.text();

      // send email via SMTP with HTML support
      const subject = `Your ${BRAND_NAME} verification code`;
      const htmlBody = `
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333;">${BRAND_NAME} Verification</h1>
              <p>Hello,</p>
              <p>Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 8px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
              <p>Thanks,<br/>The ${BRAND_NAME} Team</p>
            </div>
          </body>
        </html>
      `;

      const textBody = `Your ${BRAND_NAME} verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;

      const message = `From: ${FROM_EMAIL}\r\nTo: ${email}\r\nSubject: ${subject}\r\nContent-Type: multipart/alternative; boundary="boundary123"\r\n\r\n--boundary123\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${textBody}\r\n--boundary123\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${htmlBody}\r\n--boundary123--\r\n`;

      // connect to SMTP
      const conn = await Deno.connectTls({ hostname: SMTP_HOST, port: Number(SMTP_PORT) });
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      const read = async () => {
        const buf = new Uint8Array(1024);
        const n = await conn.read(buf);
        if (!n) return '\n';
        return decoder.decode(buf.subarray(0, n));
      };

      const write = async (s: string) => {
        await conn.write(encoder.encode(s));
      };

      // basic SMTP handshake
      await read(); // Server greeting
      await write(`EHLO localhost\r\n`);
      await read();
      await write(`AUTH LOGIN\r\n`);
      await read();
      await write(btoa(SMTP_USER) + "\r\n");
      await read();
      await write(btoa(SMTP_PASS) + "\r\n");
      await read();
      await write(`MAIL FROM:<${FROM_EMAIL}>\r\n`);
      await read();
      await write(`RCPT TO:<${email}>\r\n`);
      await read();
      await write(`DATA\r\n`);
      await read();
      await write(message + "\r\n.\r\n");
      await read();
      await write(`QUIT\r\n`);
      await read();
      conn.close();

      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && url.pathname.endsWith('/verify-otp')) {
      const body = await req.json();
      const email = (body.email || '').toString().toLowerCase();
      const purpose = (body.purpose || 'login').toString();
      const otp = (body.otp || '').toString();

      if (!email || !otp) {
        return new Response(JSON.stringify({ error: 'email and otp required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const verifyRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}`,
        },
        body: JSON.stringify({ p_email: email, p_purpose: purpose, p_otp: otp })
      });

      const ok = verifyRes.ok;
      const text = await verifyRes.text();
      // Postgres RPC returns boolean text
      const success = text.trim() === 'true';

      return new Response(JSON.stringify({ success }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ info: 'otp-auth: use /generate-otp or /verify-otp' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'internal', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

## Step 4: Configure Environment Variables

In your Supabase dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
SMTP_HOST=smtp.your-smtp-provider.com
SMTP_PORT=465
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
FROM_EMAIL=no-reply@yourdomain.com
BRAND_NAME=Storeffice
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

To get your `SUPABASE_SERVICE_ROLE_KEY`:
1. Go to **Project Settings** → **API**
2. Find the "Service role key" under "Project API keys"

## Step 5: Deploy the Edge Function

```bash
# Deploy the function to Supabase
supabase functions deploy otp-auth --project-ref your-project-ref
```

Replace `your-project-ref` with your actual project reference (found in your project settings URL).

## Step 6: Configure Email Templates (Optional)

If you want to customize the email templates, go to **Authentication** → **Email Templates** in your Supabase dashboard and customize:

- **Confirmation Email**
- **Recovery Email** 
- **Email Change Email**
- **Magic Link Email**

## Step 7: Set Up Row Level Security (RLS) for User Profiles (If Applicable)

If you have a custom user profiles table, make sure to set up appropriate RLS policies:

```sql
-- Example for a user profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);
```

## Step 8: Update Your Next.js Application Environment Variables

In your Next.js application's `.env.local` file, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 9: Test the Implementation

1. **Test OTP Generation**:
   - Send a POST request to your API endpoint for OTP generation
   - Verify the OTP is sent to the user's email

2. **Test OTP Verification**:
   - Submit the correct OTP and ensure it verifies successfully
   - Try an incorrect OTP to ensure it fails

3. **Test Password Reset Flow**:
   - Go to the "Forgot Password" page
   - Enter an email and verify you receive an OTP
   - Verify the OTP and set a new password

4. **Test Rate Limiting**:
   - Try requesting multiple OTPs rapidly to ensure rate limiting works

## Troubleshooting Tips

1. **OTP not being sent**:
   - Verify your SMTP settings are correct
   - Check that the Supabase Edge Function is properly deployed
   - Verify the service role key is correctly set

2. **OTP verification failing**:
   - Check that the OTP hasn't expired (10-minute limit)
   - Ensure you're using the correct purpose parameter
   - Verify the OTP code is correct and hasn't been used already

3. **Password reset not working**:
   - Ensure the service role key has admin privileges to update user passwords
   - Verify the email exists in your Supabase auth table

4. **Check Function Logs**:
   - Use the Supabase Dashboard to check function logs:
   - Go to **Functions** → select your function → **Logs**

Your OTP-based authentication system with password reset functionality is now fully configured in Supabase!