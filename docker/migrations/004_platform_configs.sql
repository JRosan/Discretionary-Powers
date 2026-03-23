-- Platform-level configuration (global, not tenant-scoped)
CREATE TABLE IF NOT EXISTS platform_configs (
    key text PRIMARY KEY,
    value text NOT NULL,
    is_secret boolean NOT NULL DEFAULT false,
    description text,
    category text NOT NULL DEFAULT 'general',
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default configs
INSERT INTO platform_configs (key, value, is_secret, description, category) VALUES
('placetopay:login', '', true, 'PlaceToPay API login', 'payment'),
('placetopay:secret_key', '', true, 'PlaceToPay API secret key', 'payment'),
('placetopay:endpoint', 'https://checkout-test.placetopay.com', false, 'PlaceToPay API endpoint (sandbox or production)', 'payment'),
('smtp:host', 'localhost', false, 'SMTP server hostname', 'email'),
('smtp:port', '1025', false, 'SMTP server port', 'email'),
('smtp:from', 'noreply@govdecision.com', false, 'Default sender email address', 'email'),
('msgraph:tenant_id', '', true, 'Microsoft Graph tenant ID', 'email'),
('msgraph:client_id', '', true, 'Microsoft Graph client ID', 'email'),
('msgraph:client_secret', '', true, 'Microsoft Graph client secret', 'email'),
('general:platform_name', 'GovDecision', false, 'Platform display name', 'general'),
('general:support_email', 'support@govdecision.com', false, 'Support contact email', 'general'),
('general:default_trial_days', '14', false, 'Default trial period in days', 'general')
ON CONFLICT (key) DO NOTHING;
