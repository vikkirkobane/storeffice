# Supabase OTP Authentication Implementation Guide

I'll provide you with a comprehensive guide to set up and configure Supabase for the OTP (One-Time Password) authentication system that we've implemented in your Storeffice application.

## Table of Contents
1. [Supabase Project Setup](#supabase-project-setup)
2. [Email Configuration](#email-configuration)
3. [Authentication Settings](#authentication-settings)
4. [Email Templates Customization](#email-templates-customization)
5. [Security Configuration](#security-configuration)
6. [Testing the OTP Flow](#testing-the-otp-flow)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

## Supabase Project Setup

### 1. Create or Access Your Supabase Project
- Go to [https://supabase.com](https://supabase.com) and sign in
- Create a new project or select your existing Storeffice project

### 2. Get Your Project Keys
- Navigate to your project dashboard
- Go to **Project Settings** → **API**
- Note down the following:
  - URL (also called Supabase URL)
  - Project Ref (also called Supabase Project ID)
  - Public API Key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Your Environment Variables
Update your `.env.local` file with your actual Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Email Configuration

### 1. Configure SMTP Settings
- Go to your Supabase Dashboard
- Navigate to **Authentication** → **Settings**
- Under **Email Configuration**, you have two options:

**Option A: Using Built-in Email Provider (Recommended for testing)**
- No additional setup needed - Supabase provides a free email service for up to 100 emails/day
- Ensure the "Enable email confirmations" toggle is ON

**Option B: Using Custom SMTP (For production)**
- Click on **SMTP Settings**
- Configure with your SMTP provider (e.g., SendGrid, Mailgun, AWS SES):
  - Host: Your SMTP server address
  - Port: SMTP port (usually 587 for TLS)
  - Username: Your SMTP username
  - Password: Your SMTP password
  - Sender: Display name and email address

### 2. Set Up Email Redirect URLs
- In the **Authentication** → **URL Configuration** section:
  - **Site URL**: Add your site URL (e.g., `http://localhost:3000` for development)
  - **Redirect URLs**: Add the URLs where users should be redirected after authentication actions:
    - `http://localhost:3000/verify-otp`
    - `http://localhost:3000/dashboard`
    - `http://localhost:3000/`
  - Save the settings

## Authentication Settings

### 1. Enable OTP Authentication
- Navigate to **Authentication** → **Settings**
- Ensure the following settings are configured:
  - ✅ **Enable email confirmations** - ON
  - ✅ **Enable email change** - ON (optional)
  - ✅ **Enable phone login** - OFF (we're using email OTP only)
  - ✅ **Enable signups** - ON
  - ✅ **Enable weak password detection** - ON (recommended)

### 2. Configure Password Requirements (if using password fallback)
- In the same **Settings** section:
  - Minimum password length: 6 characters (or your preference)
  - Enable password complexity requirements (optional)

### 3. Configure Email OTP Settings
- In **Authentication** → **Settings**:
  - Set the **Email OTP expiry time** (default is 60 seconds, adjust as needed)
  - Configure whether to **Enable email change OTP** if needed

## Email Templates Customization

### 1. Customize OTP Email Template
- Go to **Authentication** → **Email Templates**
- Find the **Email confirmation** template (this is used for OTP)
- Customize the email content:

```html
<h2>Confirm your email</h2>
<p>Thank you for signing up for Storeffice! Use the OTP below to verify your email address:</p>
<p style="font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">{magiclink}</p>
<p>This OTP will expire in 60 seconds. If you didn't request this, please ignore this email.</p>
<p>Need help? Contact our support team at support@storeffice.com</p>
```

### 2. Customize Recovery Email (for password reset)
- Find the **Password recovery** template
- Customize with your brand:

```html
<h2>Password Reset Request</h2>
<p>You requested a password reset for your Storeffice account. Use this OTP to reset your password:</p>
<p style="font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">{magiclink}</p>
<p>This OTP will expire in 60 seconds. If you didn't request this, please ignore this email.</p>
```

## Security Configuration

### 1. Configure Rate Limiting
- Go to **Authentication** → **Settings**
- Set appropriate rate limits:
  - **Rate limit** for signups: 30 requests per minute per IP
  - **Rate limit** for login attempts: 30 requests per minute per IP
  - **Rate limit** for email OTP: 10 requests per minute per IP

### 2. Set Up Row Level Security (RLS) for User Profiles
- In your SQL editor, if you have a `profiles` table, set up RLS:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to update only their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to view only their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);
```

### 3. Secure Your Database Functions
- In **Database** → **SQL Editor**, ensure any custom auth functions are properly secured
- Use `auth.uid()` to verify user identity in database functions

## Testing the OTP Flow

### 1. Test User Registration Flow
- Navigate to your `/signup` page
- Register with a valid email address
- Check your email for the OTP
- Verify that the OTP is received and can be used

### 2. Test Login Flow
- Navigate to your `/login` page
- Enter your email address
- Receive the OTP in your email
- Verify successful login after entering the OTP

### 3. Test Resend Functionality
- On the OTP verification page, wait for the countdown to expire
- Verify that you can request a new OTP
- Check that the countdown prevents spamming

### 4. Test Error Handling
- Try submitting invalid email addresses
- Test with incorrect OTP codes
- Verify that appropriate error messages are displayed

## Error Handling Configuration

### 1. Supabase Error Messages
- In your Supabase project settings, you can configure error message visibility
- For security, limit the details in error messages in production

### 2. Frontend Error Handling
The implemented code includes proper error handling:
- User-friendly error messages
- Clear guidance for users
- Proper loading states

### 3. Monitor Authentication Events
- In your Supabase dashboard, visit **Authentication** → **Logs**
- Monitor successful and failed authentication attempts
- Check for any configuration issues

## Troubleshooting

### Common Issues and Solutions

1. **OTP Emails Not Being Received**
   - Check your spam/junk folder
   - Verify your email is not from a disposable email service
   - Ensure your domain isn't blocked
   - Check Supabase email logs for delivery status

2. **"Invalid OTP" Errors**
   - Verify the OTP hasn't expired (default 60 seconds)
   - Check that you're entering the code correctly
   - Ensure you're using the most recent OTP received

3. **Redirect Issues**
   - Verify your redirect URLs in Supabase settings match your app's URLs
   - Make sure your `NEXT_PUBLIC_SUPABASE_URL` is correct

4. **CORS Issues**
   - Ensure your site URL in Supabase settings is correct
   - Check for any proxy or firewall issues

5. **Environment Variables Not Working**
   - Ensure you're using `NEXT_PUBLIC_` prefix for frontend-accessible variables
   - Restart your development server after changing environment variables

### Testing Checklist

- [ ] User can register and receive OTP
- [ ] User can verify OTP and complete registration
- [ ] User can log in using OTP
- [ ] User can request a new OTP when needed
- [ ] Proper error messages display for invalid inputs
- [ ] OTP expires after configured time
- [ ] Throttling prevents spam
- [ ] Password fallback option works (if implemented)

### Production Considerations

- [ ] Set up custom SMTP for reliable email delivery
- [ ] Configure proper rate limits based on your user base
- [ ] Set up monitoring for authentication events
- [ ] Implement proper logging
- [ ] Ensure you have sufficient email quota for your user volume
- [ ] Set up proper authentication audit trails

## Additional Security Recommendations

1. **Enable MFA** (if needed): Consider adding multi-factor authentication for sensitive accounts
2. **Session Management**: Configure appropriate session timeouts
3. **Brute Force Protection**: Implement additional protections if needed
4. **Custom JWT Claims**: Use custom claims for role-based access if needed
5. **Database Security**: Implement Row Level Security for all sensitive tables