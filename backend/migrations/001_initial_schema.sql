-- DPMS Initial Schema Migration
-- This script creates the complete database schema for the Discretionary Powers Management System.
-- It matches the EF Core entity configurations with snake_case naming conventions.
--
-- Usage:
--   psql -h localhost -U postgres -d discretionary_powers -f 001_initial_schema.sql

BEGIN;

-- ============================================================================
-- PostgreSQL Enum Types
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'minister',
    'permanent_secretary',
    'legal_advisor',
    'auditor',
    'public'
);

CREATE TYPE decision_status AS ENUM (
    'draft',
    'in_progress',
    'under_review',
    'approved',
    'published',
    'challenged',
    'withdrawn'
);

CREATE TYPE step_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'skipped_with_reason'
);

CREATE TYPE decision_type AS ENUM (
    'regulatory',
    'licensing',
    'planning',
    'financial',
    'appointment',
    'policy',
    'enforcement',
    'other'
);

CREATE TYPE judicial_review_ground AS ENUM (
    'illegality',
    'irrationality',
    'procedural_impropriety',
    'proportionality'
);

CREATE TYPE document_classification AS ENUM (
    'evidence',
    'legal_opinion',
    'correspondence',
    'public_notice',
    'internal_memo'
);

CREATE TYPE notification_type AS ENUM (
    'assignment',
    'approval_needed',
    'overdue',
    'status_change',
    'comment',
    'judicial_review'
);

-- ============================================================================
-- Tables
-- ============================================================================

-- 1. Ministries
CREATE TABLE ministries (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    code        text        NOT NULL,
    active      boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ministries_code_idx ON ministries (code);

-- 2. Users
CREATE TABLE users (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text        NOT NULL,
    name          text        NOT NULL,
    password_hash text,
    role          user_role   NOT NULL,
    ministry_id   uuid        REFERENCES ministries(id) ON DELETE SET NULL,
    mfa_enabled   boolean     NOT NULL DEFAULT false,
    active        boolean     NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_idx ON users (email);

-- 3. Decisions
CREATE TABLE decisions (
    id                   uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number     text            NOT NULL,
    title                text            NOT NULL,
    description          text,
    ministry_id          uuid            NOT NULL REFERENCES ministries(id) ON DELETE RESTRICT,
    decision_type        decision_type   NOT NULL,
    status               decision_status NOT NULL DEFAULT 'draft',
    current_step         integer         NOT NULL DEFAULT 1,
    created_by           uuid            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to          uuid            REFERENCES users(id) ON DELETE SET NULL,
    is_public            boolean         NOT NULL DEFAULT false,
    judicial_review_flag boolean         NOT NULL DEFAULT false,
    deadline             timestamptz,
    publication_deadline timestamptz,
    metadata             jsonb,
    created_at           timestamptz     NOT NULL DEFAULT now(),
    updated_at           timestamptz     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX decisions_reference_number_idx ON decisions (reference_number);
CREATE INDEX decisions_ministry_id_idx ON decisions (ministry_id);
CREATE INDEX decisions_status_idx ON decisions (status);
CREATE INDEX decisions_created_by_idx ON decisions (created_by);
CREATE INDEX decisions_assigned_to_idx ON decisions (assigned_to);

-- 4. Decision Steps
CREATE TABLE decision_steps (
    id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id  uuid        NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    step_number  integer     NOT NULL,
    status       step_status NOT NULL DEFAULT 'not_started',
    started_at   timestamptz,
    completed_at timestamptz,
    completed_by uuid,
    data         jsonb,
    notes        text,
    evidence     jsonb,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX decision_steps_decision_step_unique ON decision_steps (decision_id, step_number);

-- 5. Documents
CREATE TABLE documents (
    id                uuid                    PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id       uuid                    NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    filename          text                    NOT NULL,
    original_filename text                    NOT NULL,
    mime_type         text                    NOT NULL,
    size_bytes        integer                 NOT NULL,
    storage_key       text                    NOT NULL,
    classification    document_classification NOT NULL,
    uploaded_by       uuid                    NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    version           integer                 NOT NULL DEFAULT 1,
    is_redacted       boolean                 NOT NULL DEFAULT false,
    redaction_notes   text,
    created_at        timestamptz             NOT NULL DEFAULT now()
);

-- 6. Comments
CREATE TABLE comments (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id uuid        NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content     text        NOT NULL,
    is_internal boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 7. Notifications
CREATE TABLE notifications (
    id          uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision_id uuid              REFERENCES decisions(id) ON DELETE SET NULL,
    type        notification_type NOT NULL,
    title       text              NOT NULL,
    message     text              NOT NULL,
    read        boolean           NOT NULL DEFAULT false,
    sent_at     timestamptz       NOT NULL DEFAULT now(),
    read_at     timestamptz
);

-- 8. Audit Entries (cryptographically chained)
CREATE TABLE audit_entries (
    id            bigint      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    decision_id   uuid        REFERENCES decisions(id) ON DELETE SET NULL,
    user_id       uuid        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action        text        NOT NULL,
    step_number   integer,
    detail        jsonb,
    ip_address    text,
    previous_hash text,
    entry_hash    text        NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_entries_decision_id_idx ON audit_entries (decision_id);
CREATE INDEX audit_entries_user_id_idx ON audit_entries (user_id);
CREATE INDEX audit_entries_created_at_idx ON audit_entries (created_at);

-- 9. Judicial Reviews
CREATE TABLE judicial_reviews (
    id              uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id     uuid                  NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    ground          judicial_review_ground NOT NULL,
    status          text                  NOT NULL DEFAULT 'filed',
    filed_date      date                  NOT NULL,
    court_reference text,
    outcome         text,
    notes           text,
    created_by      uuid                  NOT NULL,
    created_at      timestamptz           NOT NULL DEFAULT now(),
    updated_at      timestamptz           NOT NULL DEFAULT now()
);

COMMIT;
