-- Migration: Add billing tables for PlaceToPay subscription integration
-- Run against PostgreSQL

CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id),
    plan text NOT NULL DEFAULT 'starter',
    status text NOT NULL DEFAULT 'active',
    monthly_price numeric(10,2) NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'USD',
    payment_token text,
    current_period_start timestamptz NOT NULL DEFAULT now(),
    current_period_end timestamptz NOT NULL DEFAULT now() + interval '30 days',
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);

CREATE TABLE IF NOT EXISTS payment_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id),
    subscription_id uuid REFERENCES subscriptions(id),
    request_id text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    amount numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    reference text,
    placetopay_status text,
    receipt_number text,
    payment_method text,
    created_at timestamptz NOT NULL DEFAULT now(),
    paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_payment_records_org ON payment_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_request ON payment_records(request_id);
