-- Supabase Database Functions for OTP System with TurboSMTP

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