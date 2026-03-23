-- Migration: Add demo_requests table for demo booking functionality
-- Date: 2026-03-23

CREATE TABLE IF NOT EXISTS demo_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    organization text NOT NULL,
    job_title text NOT NULL,
    country text NOT NULL,
    user_range text,
    message text,
    preferred_date text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests (status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests (created_at DESC);
