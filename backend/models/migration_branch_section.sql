-- Migration: Add branch, section to users table and ensure OTP support
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(100);
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE;
