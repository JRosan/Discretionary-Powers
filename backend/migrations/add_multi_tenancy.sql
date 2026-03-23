-- Multi-tenancy migration: Add organizations table and organization_id to all entities

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    logo_url text,
    primary_color text,
    accent_color text,
    domain text,
    hero_image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Insert default BVI organization
INSERT INTO organizations (id, name, slug, primary_color, accent_color)
VALUES ('00000000-0000-0000-0000-000000000001', 'Government of the Virgin Islands', 'bvi', '#1D3557', '#2A9D8F')
ON CONFLICT (id) DO NOTHING;

-- 3. Add organization_id column to all tables (nullable initially)
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE audit_entries ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE judicial_reviews ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- 4. Set all existing data to BVI organization
UPDATE ministries SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE users SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE decisions SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE audit_entries SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE notifications SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE comments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE judicial_reviews SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE system_settings SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE documents SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;

-- 5. Make organization_id NOT NULL after data migration
ALTER TABLE ministries ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE decisions ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE audit_entries ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE comments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE judicial_reviews ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE system_settings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN organization_id SET NOT NULL;

-- 6. Add indexes for organization_id
CREATE INDEX IF NOT EXISTS ministries_organization_id_idx ON ministries(organization_id);
CREATE INDEX IF NOT EXISTS users_organization_id_idx ON users(organization_id);
CREATE INDEX IF NOT EXISTS decisions_organization_id_idx ON decisions(organization_id);
CREATE INDEX IF NOT EXISTS audit_entries_organization_id_idx ON audit_entries(organization_id);
CREATE INDEX IF NOT EXISTS notifications_organization_id_idx ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS comments_organization_id_idx ON comments(organization_id);
CREATE INDEX IF NOT EXISTS judicial_reviews_organization_id_idx ON judicial_reviews(organization_id);
CREATE INDEX IF NOT EXISTS documents_organization_id_idx ON documents(organization_id);
