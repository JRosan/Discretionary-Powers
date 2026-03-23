-- Migration: Add email verification and onboarding fields
-- Date: 2026-03-23

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Set existing orgs as completed (they were set up manually)
UPDATE organizations SET onboarding_completed = true;
UPDATE users SET email_verified = true WHERE active = true;
