# Supabase OTP Authentication with TurboSMTP Implementation Guide

This comprehensive guide will help you implement the OTP (One-Time Password) authentication system using Supabase and TurboSMTP as your email provider.

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Supabase Functions Setup](#supabase-functions-setup)
4. [TurboSMTP Configuration](#turbosmtp-configuration)
5. [Deno Edge Function Implementation](#deno-edge-function-implementation)
6. [Frontend Integration](#frontend-integration)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

This implementation uses:
- Supabase for user management and database functions
- TurboSMTP for sending OTP emails
- Deno Edge Functions for OTP generation and verification
- Custom authentication flow with email OTP

## Database Setup

### 1. Create OTP Database Schema

Execute the following SQL in your Supabase SQL editor:

```sql
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

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_purpose ON otp_codes (email, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes (expires_at);
```

### 2. Verify Database Setup

Run these queries to ensure the setup is correct:

```sql
-- Test the create_otp function
SELECT create_otp('test@example.com', 'login') as otp_code;

-- Test the verify_otp function
SELECT verify_otp('test@example.com', 'login', '123456') as is_valid;

-- Check if the table exists
SELECT * FROM otp_codes LIMIT 10;
```

## Supabase Functions Setup

### 1. Create the Deno Edge Function

Create a new file `functions/otp-auth/index.ts` in your Supabase project:

```typescript
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { encode as btoa } from "https://deno.land/std@0.203.0/encoding/base64url.ts";

console.info('otp-auth function starting');

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\//, '');
  // simple router: /otp-auth/generate-otp and /otp-auth/verify-otp
  const path = pathname.split('/').slice(1).join('/');

  // env
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Deno.env.get('SMTP_PORT') || '465';
  const SMTP_USER = Deno.env.get('SMTP_USER');
  const SMTP_PASS = Deno.env.get('SMTP_PASS');
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'no-reply@example.com';

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
        return new Response(JSON.stringify({ error: 'db_error', detail: text }), { 
          status: 502, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      
      const otp = await createRes.text();

      // send email via SMTP (basic SMTP over TLS using Deno's Tcp + TLS)
      // build SMTP message
      const subject = 'Your verification code';
      const bodyText = `Your verification code is: ${otp}`;
      const message = `From: ${FROM_EMAIL}\r\nTo: ${email}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${bodyText}\r\n`;

      // connect
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
      await read();
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

### 2. Deploy the Edge Function

Run the following command to deploy the function:

```bash
supabase functions deploy otp-auth --project-ref <your-project-ref>
```

## TurboSMTP Configuration

### 1. Sign Up with TurboSMTP
- Go to [https://www.turbosmtp.com/](https://www.turbosmtp.com/)
- Create an account and set up your SMTP settings

### 2. Get Your TurboSMTP Credentials
- Login to your TurboSMTP dashboard
- Navigate to **Settings** → **SMTP Settings**
- Note down:
  - **SMTP Server**: Usually `smtp.turbosmtp.com`
  - **Port**: Usually `465` (SSL) or `587` (TLS)
  - **Username**: Your TurboSMTP email address
  - **Password**: Your TurboSMTP application password

### 3. Configure Email Addresses
- In the TurboSMTP dashboard, verify the email address you want to send from
- This will typically be your `FROM_EMAIL` address

## Deno Edge Function Implementation

### 1. Update the Deno Function (if needed)

The provided function should work as-is, but you can customize it further:

```typescript
// Enhanced version with HTML email support and better error handling
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

## Frontend Integration

### 1. Update Your Frontend API Calls

Create API utility functions to call your edge functions:

```typescript
// lib/otp-api.ts
export const generateOTP = async (email: string, purpose: string = 'login') => {
  const response = await fetch('/api/otp/generate-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, purpose }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send OTP');
  }

  return response.json();
};

export const verifyOTP = async (email: string, otp: string, purpose: string = 'login') => {
  const response = await fetch('/api/otp/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, purpose }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid OTP');
  }

  return response.json();
};
```

### 2. Update Your Login Page to Use the New API

```typescript
// pages/login.tsx (or your new login page)
import { useState } from 'react';
import { useRouter } from 'next/router';
import { generateOTP, verifyOTP } from '../lib/otp-api';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await generateOTP(email, 'login');
      setShowOtpInput(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOTP(email, otp, 'login');
      
      if (result.success) {
        // Complete the login process
        await login(email, otp); // If using magic link approach
        router.push('/dashboard');
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {!showOtpInput ? (
          // Email input form
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          // OTP verification form
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setShowOtpInput(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

## Environment Variables

### 1. Update Your `.env.local` File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMTP (TurboSMTP)
SMTP_HOST=smtp.turbosmtp.com
SMTP_PORT=465
SMTP_USER=your-turbosmtp-email
SMTP_PASS=your-turbosmtp-password
FROM_EMAIL=your-verified-email@domain.com
BRAND_NAME=Storeffice
```

### 2. Configure Environment Variables in Supabase Dashboard

Go to your Supabase Dashboard → Settings → Environment Variables and add:

```
SMTP_HOST: smtp.turbosmtp.com
SMTP_PORT: 465
SMTP_USER: your-turbosmtp-email
SMTP_PASS: your-turbosmtp-password
FROM_EMAIL: your-verified-email@domain.com
BRAND_NAME: Storeffice
SUPABASE_URL: https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY: your-service-role-key
```

## Testing

### 1. Test the OTP Generation

```bash
# Test OTP generation
curl -X POST http://localhost:54321/functions/v1/otp-auth/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "purpose": "login"}'
```

### 2. Test OTP Verification

```bash
# First generate an OTP, then test verification
curl -X POST http://localhost:54321/functions/v1/otp-auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456", "purpose": "login"}'
```

### 3. Full Integration Test

- Register a new user
- Verify OTP is received in email
- Verify user can log in with OTP
- Test OTP expiration (after 10 minutes)
- Test invalid OTP handling

## Troubleshooting

### Common Issues and Solutions

1. **SMTP Connection Issues**
   - Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are correct
   - Check if firewall is blocking the SMTP port
   - Ensure your credentials have proper permissions

2. **Deno Edge Function Not Deploying**
   - Check that your project ref is correct
   - Verify you have the Supabase CLI installed
   - Check for syntax errors in your function code

3. **OTP Not Receiving Emails**
   - Check spam/junk folder
   - Verify FROM_EMAIL is properly verified in TurboSMTP
   - Check if there are any domain blocking issues

4. **Database Function Issues**
   - Ensure service role key is properly set
   - Check that the functions exist in your database
   - Verify the RLS policies are configured correctly

5. **CORS Issues**
   - Add proper CORS settings in Supabase Dashboard
   - Check that your frontend URL is allowed

6. **Rate Limiting**
   - TurboSMTP may have rate limits
   - Check your TurboSMTP plan for email sending limits

### Debugging Steps

1. Check Supabase logs for errors
2. Verify all environment variables are set correctly
3. Test SMTP connection directly
4. Verify database functions are working
5. Check the edge function logs in your Supabase Dashboard

### Security Notes

- Never expose service role keys in frontend code
- Use proper rate limiting to prevent abuse
- Implement proper validation for all inputs
- Consider using temporary sessions after OTP verification
- Secure your edge functions with proper authentication

This comprehensive guide should help you successfully implement the OTP authentication system with TurboSMTP. Remember to test thoroughly in a development environment before deploying to production.