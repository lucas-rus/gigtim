-- ============================================================
-- GigTim — Initial Database Schema (IDEMPOTENT)
-- Supabase (PostgreSQL) migration
-- PRD reference: GigApp_PRD.md §4 "Database Schema"
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. Custom ENUM types (idempotent via DO blocks)
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE worker_skill AS ENUM ('BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- 2. Tables
-- ────────────────────────────────────────────────────────────

-- 2.1  Users (base table, linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role       user_role    NOT NULL,
    auth_id    UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users IS 'Base user record — every authenticated person has exactly one row.';
COMMENT ON COLUMN users.auth_id IS 'FK → Supabase auth.users. One-to-one mapping.';

-- 2.2  Worker Profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
    user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name              TEXT          NOT NULL,
    cnp                    CHAR(13)      NOT NULL UNIQUE
                             CHECK (cnp ~ '^\d{13}$'),
    id_card_series         TEXT          NOT NULL,
    reliability_score      NUMERIC(2,1)  NOT NULL DEFAULT 5.0
                             CHECK (reliability_score >= 1.0 AND reliability_score <= 5.0),
    total_shifts_completed INT           NOT NULL DEFAULT 0
                             CHECK (total_shifts_completed >= 0),
    skills                 worker_skill[] NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE  worker_profiles IS 'Extended profile for WORKER users. Stores ITM-required PII (CNP, CI).';
COMMENT ON COLUMN worker_profiles.cnp IS 'Romanian Personal Numeric Code — exactly 13 digits. Required for ITM (Legea 52/2011).';

-- 2.3  Employer Profiles
CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name    TEXT          NOT NULL,
    cui             TEXT          NOT NULL,
    address         TEXT          NOT NULL,
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    employer_rating NUMERIC(2,1)  DEFAULT NULL
                       CHECK (employer_rating IS NULL OR (employer_rating >= 1.0 AND employer_rating <= 5.0))
);

COMMENT ON TABLE  employer_profiles IS 'Extended profile for EMPLOYER users. Stores CUI (Romanian Tax ID) and business location.';

-- 2.4  Job Shifts
CREATE TABLE IF NOT EXISTS job_shifts (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id     UUID          NOT NULL REFERENCES employer_profiles(user_id) ON DELETE CASCADE,
    role_needed     worker_skill  NOT NULL,
    start_time      TIMESTAMPTZ   NOT NULL,
    end_time        TIMESTAMPTZ   NOT NULL,
    hourly_pay_ron  NUMERIC(8,2)  NOT NULL CHECK (hourly_pay_ron > 0),
    status          shift_status  NOT NULL DEFAULT 'OPEN',
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT end_after_start CHECK (end_time > start_time)
);

COMMENT ON TABLE job_shifts IS 'A single bookable shift posted by an employer.';

-- 2.5  Applications
CREATE TABLE IF NOT EXISTS applications (
    id         UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id   UUID               NOT NULL REFERENCES job_shifts(id) ON DELETE CASCADE,
    worker_id  UUID               NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    status     application_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ        NOT NULL DEFAULT now(),

    -- A worker may only apply once per shift
    CONSTRAINT unique_application UNIQUE (shift_id, worker_id)
);

COMMENT ON TABLE applications IS 'A worker''s application to a specific shift.';

-- ────────────────────────────────────────────────────────────
-- 3. Indexes (performance)
-- ────────────────────────────────────────────────────────────

-- Fast lookup of open shifts by status and time window
CREATE INDEX IF NOT EXISTS idx_job_shifts_status_start ON job_shifts (status, start_time);

-- Geo queries: allow PostGIS-less bounding-box filtering on lat/lng
CREATE INDEX IF NOT EXISTS idx_employer_profiles_location ON employer_profiles (lat, lng);

-- Application queries per shift and per worker
CREATE INDEX IF NOT EXISTS idx_applications_shift  ON applications (shift_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications (worker_id);

-- ────────────────────────────────────────────────────────────
-- 4. Row Level Security (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on every table
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_shifts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;

-- ── 4.1  users ─────────────────────────────────────────────

-- Users can read their own row
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

-- Users can update their own row
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);

-- Insert is done via a server-side trigger / Edge Function on sign-up.
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = auth_id);

-- ── 4.2  worker_profiles ──────────────────────────────────

DROP POLICY IF EXISTS "worker_profiles_select_own" ON worker_profiles;
CREATE POLICY "worker_profiles_select_own"
    ON worker_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = worker_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "worker_profiles_select_employers" ON worker_profiles;
CREATE POLICY "worker_profiles_select_employers"
    ON worker_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.role = 'EMPLOYER'
        )
    );

DROP POLICY IF EXISTS "worker_profiles_insert_own" ON worker_profiles;
CREATE POLICY "worker_profiles_insert_own"
    ON worker_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = worker_profiles.user_id
              AND users.auth_id = auth.uid()
              AND users.role = 'WORKER'
        )
    );

DROP POLICY IF EXISTS "worker_profiles_update_own" ON worker_profiles;
CREATE POLICY "worker_profiles_update_own"
    ON worker_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = worker_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = worker_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- ── 4.3  employer_profiles ────────────────────────────────

DROP POLICY IF EXISTS "employer_profiles_select_own" ON employer_profiles;
CREATE POLICY "employer_profiles_select_own"
    ON employer_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = employer_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "employer_profiles_select_workers" ON employer_profiles;
CREATE POLICY "employer_profiles_select_workers"
    ON employer_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.role = 'WORKER'
        )
    );

DROP POLICY IF EXISTS "employer_profiles_insert_own" ON employer_profiles;
CREATE POLICY "employer_profiles_insert_own"
    ON employer_profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = employer_profiles.user_id
              AND users.auth_id = auth.uid()
              AND users.role = 'EMPLOYER'
        )
    );

DROP POLICY IF EXISTS "employer_profiles_update_own" ON employer_profiles;
CREATE POLICY "employer_profiles_update_own"
    ON employer_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = employer_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = employer_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- ── 4.4  job_shifts ───────────────────────────────────────

DROP POLICY IF EXISTS "job_shifts_select_open" ON job_shifts;
CREATE POLICY "job_shifts_select_open"
    ON job_shifts FOR SELECT
    USING (status = 'OPEN');

DROP POLICY IF EXISTS "job_shifts_select_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_select_employer_own"
    ON job_shifts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.id = job_shifts.employer_id
        )
    );

DROP POLICY IF EXISTS "job_shifts_select_worker_applied" ON job_shifts;
CREATE POLICY "job_shifts_select_worker_applied"
    ON job_shifts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications
            JOIN users ON users.id = applications.worker_id
            WHERE applications.shift_id = job_shifts.id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "job_shifts_insert_employer" ON job_shifts;
CREATE POLICY "job_shifts_insert_employer"
    ON job_shifts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.id = job_shifts.employer_id
              AND users.role = 'EMPLOYER'
        )
    );

DROP POLICY IF EXISTS "job_shifts_update_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_update_employer_own"
    ON job_shifts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.id = job_shifts.employer_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.id = job_shifts.employer_id
        )
    );

-- ── 4.5  applications ─────────────────────────────────────

DROP POLICY IF EXISTS "applications_select_worker_own" ON applications;
CREATE POLICY "applications_select_worker_own"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = applications.worker_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "applications_select_employer_shifts" ON applications;
CREATE POLICY "applications_select_employer_shifts"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM job_shifts
            JOIN users ON users.id = job_shifts.employer_id
            WHERE job_shifts.id = applications.shift_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "applications_insert_worker" ON applications;
CREATE POLICY "applications_insert_worker"
    ON applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = applications.worker_id
              AND users.auth_id = auth.uid()
              AND users.role = 'WORKER'
        )
    );

DROP POLICY IF EXISTS "applications_update_employer" ON applications;
CREATE POLICY "applications_update_employer"
    ON applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM job_shifts
            JOIN users ON users.id = job_shifts.employer_id
            WHERE job_shifts.id = applications.shift_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM job_shifts
            JOIN users ON users.id = job_shifts.employer_id
            WHERE job_shifts.id = applications.shift_id
              AND users.auth_id = auth.uid()
        )
    );

-- ============================================================
-- End of initial schema migration
-- ============================================================
-- ============================================================
-- GigTim — Migration 002: Expanded Schema (IDEMPOTENT)
-- Adds: ADMIN role, phone/location fields, ID verification
--        (Persona), chat, forum, notifications, reviews,
--        admin audit log + RLS policies for everything.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Modify existing ENUMs
-- ────────────────────────────────────────────────────────────

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';

-- ────────────────────────────────────────────────────────────
-- 2. New ENUM types
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_REVIEW'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE chat_room_type AS ENUM ('SHIFT', 'DIRECT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE forum_category AS ENUM ('GENERAL', 'TIPS', 'JOBS', 'LEGAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM (
    'SHIFT_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED',
    'SHIFT_REMINDER', 'REVIEW_REQUEST', 'CHAT_MESSAGE',
    'ID_VERIFIED', 'ID_REJECTED', 'ADMIN_NOTICE'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ────────────────────────────────────────────────────────────
-- 3. Alter existing tables (idempotent)
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN ALTER TABLE worker_profiles ADD COLUMN phone_number TEXT NOT NULL DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE worker_profiles ADD COLUMN city TEXT NOT NULL DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE worker_profiles ADD COLUMN county TEXT NOT NULL DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE worker_profiles ADD COLUMN bio TEXT DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE worker_profiles ADD COLUMN profile_picture_url TEXT DEFAULT NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE employer_profiles ADD COLUMN city TEXT NOT NULL DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE employer_profiles ADD COLUMN county TEXT NOT NULL DEFAULT ''; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

COMMENT ON COLUMN employer_profiles.county IS 'Romanian county (județ).';

-- ────────────────────────────────────────────────────────────
-- 4. New tables
-- ────────────────────────────────────────────────────────────

-- 4.1  ID Verifications (Persona integration)
CREATE TABLE IF NOT EXISTS id_verifications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id         UUID NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    persona_inquiry_id TEXT UNIQUE,
    status            verification_status NOT NULL DEFAULT 'PENDING',
    persona_status    TEXT,
    rejection_reasons JSONB DEFAULT '[]',
    verified_at       TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE id_verifications IS 'Tracks Persona-based ID verification for workers. Status updated via Persona webhooks.';

-- 4.2  Chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type       chat_room_type NOT NULL,
    shift_id   UUID REFERENCES job_shifts(id) ON DELETE SET NULL,
    name       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE chat_rooms IS 'Chat rooms — SHIFT type auto-created when application accepted, DIRECT for user-to-user.';

-- 4.3  Chat room members (N:N)
CREATE TABLE IF NOT EXISTS chat_room_members (
    room_id   UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

-- 4.4  Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id    UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at  TIMESTAMPTZ
);

-- 4.5  Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL CHECK (char_length(title) > 0),
    content    TEXT NOT NULL,
    category   forum_category NOT NULL DEFAULT 'GENERAL',
    pinned     BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.6  Forum comments
CREATE TABLE IF NOT EXISTS forum_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.7  Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       notification_type NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    data       JSONB DEFAULT '{}',
    read       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.8  Reviews (mutual post-shift)
CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id    UUID NOT NULL REFERENCES job_shifts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_review UNIQUE (shift_id, reviewer_id, reviewee_id),
    CONSTRAINT no_self_review CHECK (reviewer_id <> reviewee_id)
);

-- 4.9  Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action       TEXT NOT NULL,
    target_table TEXT,
    target_id    UUID,
    metadata     JSONB DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_audit_log IS 'Immutable log of admin actions for accountability.';

-- ────────────────────────────────────────────────────────────
-- 5. Indexes for new tables
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_id_verifications_worker   ON id_verifications (worker_id);
CREATE INDEX IF NOT EXISTS idx_id_verifications_status   ON id_verifications (status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room        ON chat_messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user    ON chat_room_members (user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category      ON forum_posts (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post       ON forum_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_shift             ON reviews (shift_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee          ON reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin     ON admin_audit_log (admin_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 6. Helper: is_admin() function
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
          AND role = 'ADMIN'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────
-- 7. RLS — Enable on new tables
-- ────────────────────────────────────────────────────────────

ALTER TABLE id_verifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log   ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 8. RLS — Admin overrides on EXISTING tables (from 001)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "admin_select_all_users" ON users;
CREATE POLICY "admin_select_all_users"
    ON users FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "admin_update_all_users" ON users;
CREATE POLICY "admin_update_all_users"
    ON users FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_select_all_worker_profiles" ON worker_profiles;
CREATE POLICY "admin_select_all_worker_profiles"
    ON worker_profiles FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "admin_update_all_worker_profiles" ON worker_profiles;
CREATE POLICY "admin_update_all_worker_profiles"
    ON worker_profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_select_all_employer_profiles" ON employer_profiles;
CREATE POLICY "admin_select_all_employer_profiles"
    ON employer_profiles FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "admin_update_all_employer_profiles" ON employer_profiles;
CREATE POLICY "admin_update_all_employer_profiles"
    ON employer_profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_select_all_job_shifts" ON job_shifts;
CREATE POLICY "admin_select_all_job_shifts"
    ON job_shifts FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "admin_update_all_job_shifts" ON job_shifts;
CREATE POLICY "admin_update_all_job_shifts"
    ON job_shifts FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_select_all_applications" ON applications;
CREATE POLICY "admin_select_all_applications"
    ON applications FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "admin_update_all_applications" ON applications;
CREATE POLICY "admin_update_all_applications"
    ON applications FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────
-- 9. RLS — Policies for NEW tables
-- ────────────────────────────────────────────────────────────

-- ── 9.1  id_verifications ──────────────────────────────────

DROP POLICY IF EXISTS "id_verifications_select_own" ON id_verifications;
CREATE POLICY "id_verifications_select_own"
    ON id_verifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = id_verifications.worker_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "id_verifications_insert_own" ON id_verifications;
CREATE POLICY "id_verifications_insert_own"
    ON id_verifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = id_verifications.worker_id
              AND users.auth_id = auth.uid()
              AND users.role = 'WORKER'
        )
    );

-- Persona webhooks update via service_role key (bypasses RLS).
-- Admins can also read/update for support cases.
DROP POLICY IF EXISTS "admin_all_id_verifications" ON id_verifications;
CREATE POLICY "admin_all_id_verifications"
    ON id_verifications FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.2  chat_rooms ────────────────────────────────────────

DROP POLICY IF EXISTS "chat_rooms_select_member" ON chat_rooms;
CREATE POLICY "chat_rooms_select_member"
    ON chat_rooms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_room_members
            JOIN users ON users.id = chat_room_members.user_id
            WHERE chat_room_members.room_id = chat_rooms.id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "chat_rooms_insert_authenticated" ON chat_rooms;
CREATE POLICY "chat_rooms_insert_authenticated"
    ON chat_rooms FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin_all_chat_rooms" ON chat_rooms;
CREATE POLICY "admin_all_chat_rooms"
    ON chat_rooms FOR SELECT USING (is_admin());

-- ── 9.3  chat_room_members ─────────────────────────────────

DROP POLICY IF EXISTS "chat_room_members_select_member" ON chat_room_members;
CREATE POLICY "chat_room_members_select_member"
    ON chat_room_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = chat_room_members.user_id
              AND users.auth_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM chat_room_members crm
            JOIN users ON users.id = crm.user_id
            WHERE crm.room_id = chat_room_members.room_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "chat_room_members_insert" ON chat_room_members;
CREATE POLICY "chat_room_members_insert"
    ON chat_room_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin_all_chat_room_members" ON chat_room_members;
CREATE POLICY "admin_all_chat_room_members"
    ON chat_room_members FOR SELECT USING (is_admin());

-- ── 9.4  chat_messages ─────────────────────────────────────

DROP POLICY IF EXISTS "chat_messages_select_member" ON chat_messages;
CREATE POLICY "chat_messages_select_member"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_room_members
            JOIN users ON users.id = chat_room_members.user_id
            WHERE chat_room_members.room_id = chat_messages.room_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "chat_messages_insert_member" ON chat_messages;
CREATE POLICY "chat_messages_insert_member"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_room_members
            JOIN users ON users.id = chat_room_members.user_id
            WHERE chat_room_members.room_id = chat_messages.room_id
              AND users.auth_id = auth.uid()
              AND users.id = chat_messages.sender_id
        )
    );

DROP POLICY IF EXISTS "admin_all_chat_messages" ON chat_messages;
CREATE POLICY "admin_all_chat_messages"
    ON chat_messages FOR SELECT USING (is_admin());

-- ── 9.5  forum_posts ───────────────────────────────────────

-- All authenticated users can read posts
DROP POLICY IF EXISTS "forum_posts_select_all" ON forum_posts;
CREATE POLICY "forum_posts_select_all"
    ON forum_posts FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "forum_posts_insert_authenticated" ON forum_posts;
CREATE POLICY "forum_posts_insert_authenticated"
    ON forum_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_posts.author_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "forum_posts_update_own" ON forum_posts;
CREATE POLICY "forum_posts_update_own"
    ON forum_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_posts.author_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_posts.author_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "forum_posts_delete_own" ON forum_posts;
CREATE POLICY "forum_posts_delete_own"
    ON forum_posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_posts.author_id
              AND users.auth_id = auth.uid()
        )
    );

-- Admins can do everything (pin, delete others' posts, etc.)
DROP POLICY IF EXISTS "admin_all_forum_posts" ON forum_posts;
CREATE POLICY "admin_all_forum_posts"
    ON forum_posts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.6  forum_comments ────────────────────────────────────

DROP POLICY IF EXISTS "forum_comments_select_all" ON forum_comments;
CREATE POLICY "forum_comments_select_all"
    ON forum_comments FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "forum_comments_insert_authenticated" ON forum_comments;
CREATE POLICY "forum_comments_insert_authenticated"
    ON forum_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "forum_comments_update_own" ON forum_comments;
CREATE POLICY "forum_comments_update_own"
    ON forum_comments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "forum_comments_delete_own" ON forum_comments;
CREATE POLICY "forum_comments_delete_own"
    ON forum_comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_all_forum_comments" ON forum_comments;
CREATE POLICY "admin_all_forum_comments"
    ON forum_comments FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.7  notifications ─────────────────────────────────────

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = notifications.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = notifications.user_id
              AND users.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = notifications.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- Notifications are inserted by Edge Functions / triggers (service_role).
-- Admins can also insert (broadcast notices).
DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications"
    ON notifications FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.8  reviews ───────────────────────────────────────────

DROP POLICY IF EXISTS "reviews_select_own" ON reviews;
CREATE POLICY "reviews_select_own"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE (users.id = reviews.reviewer_id OR users.id = reviews.reviewee_id)
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
CREATE POLICY "reviews_insert_authenticated"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = reviews.reviewer_id
              AND users.auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "admin_all_reviews" ON reviews;
CREATE POLICY "admin_all_reviews"
    ON reviews FOR SELECT USING (is_admin());

-- ── 9.9  admin_audit_log ───────────────────────────────────

DROP POLICY IF EXISTS "admin_audit_log_insert" ON admin_audit_log;
CREATE POLICY "admin_audit_log_insert"
    ON admin_audit_log FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_audit_log_select" ON admin_audit_log;
CREATE POLICY "admin_audit_log_select"
    ON admin_audit_log FOR SELECT
    USING (is_admin());

-- ============================================================
-- End of migration 002
-- ============================================================
-- ============================================================
-- GigTim — Migration 003: Chat Triggers
-- Adds database triggers for Chat Notifications
-- ============================================================

-- Function to create a notification for chat messages
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    room_member_id UUID;
    sender_name TEXT;
BEGIN
    -- Get the sender's name (try worker first, then employer)
    SELECT full_name INTO sender_name FROM worker_profiles WHERE user_id = NEW.sender_id;
    IF sender_name IS NULL THEN
        SELECT company_name INTO sender_name FROM employer_profiles WHERE user_id = NEW.sender_id;
    END IF;
    
    IF sender_name IS NULL THEN
        sender_name := 'Utilizator';
    END IF;

    -- Insert a notification for every member of the room EXCEPT the sender
    FOR room_member_id IN
        SELECT user_id FROM chat_room_members WHERE room_id = NEW.room_id AND user_id != NEW.sender_id
    LOOP
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES (
            room_member_id,
            'CHAT_MESSAGE',
            'Mesaj nou de la ' || sender_name,
            substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END,
            jsonb_build_object('room_id', NEW.room_id, 'message_id', NEW.id)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a message is inserted
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON chat_messages;
CREATE TRIGGER trigger_notify_chat_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION notify_chat_message();
-- ============================================================
-- GigTim — Ratings and Reviews System
-- Supabase (PostgreSQL) migration (IDEMPOTENT)
-- ============================================================

-- 1. Create the Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id    UUID NOT NULL REFERENCES job_shifts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INT  NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Rule: A user can only leave one review per shift
    CONSTRAINT unique_shift_review UNIQUE (shift_id, reviewer_id),
    
    -- Rule: Cannot review oneself
    CONSTRAINT prevent_self_review CHECK (reviewer_id != reviewee_id)
);

COMMENT ON TABLE reviews IS 'Stores ratings/reviews given after a shift is completed.';

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_shift ON reviews (shift_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews (reviewer_id);

-- 3. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (drop first if they already exist)
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all" 
    ON reviews FOR SELECT 
    USING (true);

-- Insert logic: 
-- 1. The shift MUST be COMPLETED.
-- 2. The reviewer MUST be either the employer who created the shift OR the worker whose application was ACCEPTED.
-- We use a trigger/function to enforce this strictly because complex joins in RLS policies can be problematic for inserts.

CREATE OR REPLACE FUNCTION check_review_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    v_shift_status shift_status;
    v_employer_id UUID;
    v_accepted_worker_id UUID;
BEGIN
    -- Get shift details
    SELECT status, employer_id INTO v_shift_status, v_employer_id
    FROM job_shifts
    WHERE id = NEW.shift_id;

    -- 1. Check if shift is completed
    IF v_shift_status != 'COMPLETED' THEN
        RAISE EXCEPTION 'Nu poți lăsa o recenzie pentru o tură care nu este finalizată (COMPLETED).';
    END IF;

    -- Get the accepted worker for this shift (if any)
    SELECT worker_id INTO v_accepted_worker_id
    FROM applications
    WHERE shift_id = NEW.shift_id AND status = 'ACCEPTED'
    LIMIT 1;

    -- 2. Check if reviewer is eligible (Must be the employer or the accepted worker)
    IF NEW.reviewer_id != v_employer_id AND NEW.reviewer_id != v_accepted_worker_id THEN
        RAISE EXCEPTION 'Nu ești autorizat să lași o recenzie pentru această tură.';
    END IF;

    -- 3. Check if reviewee is the counterparty
    IF NEW.reviewer_id = v_employer_id AND NEW.reviewee_id != v_accepted_worker_id THEN
        RAISE EXCEPTION 'Ca angajator, poți recenza doar lucrătorul acceptat.';
    END IF;

    IF NEW.reviewer_id = v_accepted_worker_id AND NEW.reviewee_id != v_employer_id THEN
        RAISE EXCEPTION 'Ca lucrător, poți recenza doar angajatorul turei.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_review_rules ON reviews;
CREATE TRIGGER enforce_review_rules
    BEFORE INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION check_review_eligibility();

-- Policy to allow inserts (the trigger will block invalid ones)
DROP POLICY IF EXISTS "reviews_insert_eligible" ON reviews;
CREATE POLICY "reviews_insert_eligible"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM users WHERE id = reviewer_id
    ));

-- 5. Function to calculate average rating automatically
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
    v_avg NUMERIC(2,1);
BEGIN
    -- Calculate new average
    SELECT ROUND(AVG(rating)::numeric, 1) INTO v_avg
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id;

    -- Determine role of reviewee
    SELECT role INTO v_role FROM users WHERE id = NEW.reviewee_id;

    -- Update appropriate profile
    IF v_role = 'WORKER' THEN
        UPDATE worker_profiles SET reliability_score = v_avg WHERE user_id = NEW.reviewee_id;
    ELSIF v_role = 'EMPLOYER' THEN
        UPDATE employer_profiles SET employer_rating = v_avg WHERE user_id = NEW.reviewee_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_profile_rating ON reviews;
CREATE TRIGGER update_profile_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_average_rating();
-- ============================================================
-- GigTim — Avatars Storage System
-- Supabase (PostgreSQL) migration
-- ============================================================

-- 1. Add avatar_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN users.avatar_url IS 'Public URL of the user profile picture.';

-- 2. Create the Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3. Storage RLS Policies

-- Anyone can view avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Authenticated users can upload their own avatars
-- We enforce that the file must be uploaded to a folder matching their auth.uid()
DROP POLICY IF EXISTS "Users can upload their own avatars." ON storage.objects;
CREATE POLICY "Users can upload their own avatars."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatars
DROP POLICY IF EXISTS "Users can update their own avatars." ON storage.objects;
CREATE POLICY "Users can update their own avatars."
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatars
DROP POLICY IF EXISTS "Users can delete their own avatars." ON storage.objects;
CREATE POLICY "Users can delete their own avatars."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
-- ============================================================
-- GigTim — Migration 006: Application Chat Triggers
-- Automatically creates a Chat Room when an application is accepted
-- ============================================================

CREATE OR REPLACE FUNCTION create_chat_on_accept()
RETURNS TRIGGER AS $$
DECLARE
    new_room_id UUID;
    v_employer_id UUID;
    v_employer_name TEXT;
    v_worker_name TEXT;
BEGIN
    -- Only trigger if status changed to ACCEPTED
    IF NEW.status = 'ACCEPTED' AND OLD.status != 'ACCEPTED' THEN
        
        -- 1. Get the employer_id from the job_shifts table
        SELECT employer_id INTO v_employer_id 
        FROM job_shifts 
        WHERE id = NEW.shift_id;

        -- 2. Get the names for the room title
        SELECT company_name INTO v_employer_name FROM employer_profiles WHERE user_id = v_employer_id;
        SELECT full_name INTO v_worker_name FROM worker_profiles WHERE user_id = NEW.worker_id;

        -- 3. Create the Chat Room
        INSERT INTO chat_rooms (type, shift_id, name)
        VALUES ('SHIFT', NEW.shift_id, v_employer_name || ' & ' || v_worker_name)
        RETURNING id INTO new_room_id;

        -- 4. Add the Employer as a member
        INSERT INTO chat_room_members (room_id, user_id)
        VALUES (new_room_id, v_employer_id);

        -- 5. Add the Worker as a member
        INSERT INTO chat_room_members (room_id, user_id)
        VALUES (new_room_id, NEW.worker_id);

    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_create_chat_on_accept ON applications;
CREATE TRIGGER trigger_create_chat_on_accept
AFTER UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION create_chat_on_accept();
-- 007_rating_defaults.sql

-- 1. Update worker_profiles reliability_score
ALTER TABLE worker_profiles DROP CONSTRAINT worker_profiles_reliability_score_check;
ALTER TABLE worker_profiles ADD CONSTRAINT worker_profiles_reliability_score_check CHECK (reliability_score >= 0.0 AND reliability_score <= 5.0);
ALTER TABLE worker_profiles ALTER COLUMN reliability_score SET DEFAULT 0.0;
UPDATE worker_profiles SET reliability_score = 0.0 WHERE reliability_score = 5.0 AND total_shifts_completed = 0;

-- 2. Update employer_profiles employer_rating
ALTER TABLE employer_profiles DROP CONSTRAINT employer_profiles_employer_rating_check;
ALTER TABLE employer_profiles ADD CONSTRAINT employer_profiles_employer_rating_check CHECK (employer_rating IS NULL OR (employer_rating >= 0.0 AND employer_rating <= 5.0));
ALTER TABLE employer_profiles ALTER COLUMN employer_rating SET DEFAULT 0.0;
UPDATE employer_profiles SET employer_rating = 0.0 WHERE employer_rating IS NULL;
-- 1. Create SECURITY DEFINER functions to bypass RLS policies during permission checks

-- Helper to check if a worker has applied to a shift
CREATE OR REPLACE FUNCTION check_worker_applied(shift_uuid UUID, user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM applications
        JOIN users ON users.id = applications.worker_id
        WHERE applications.shift_id = check_worker_applied.shift_uuid
          AND users.auth_id = check_worker_applied.user_auth_id
    );
$$;

-- Helper to check if a user is the employer who posted a shift
CREATE OR REPLACE FUNCTION check_is_employer_of_shift(shift_uuid UUID, user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM job_shifts
        JOIN users ON users.id = job_shifts.employer_id
        WHERE job_shifts.id = check_is_employer_of_shift.shift_uuid
          AND users.auth_id = check_is_employer_of_shift.user_auth_id
    );
$$;

-- 2. Drop existing problematic policies on job_shifts and applications

DROP POLICY IF EXISTS "job_shifts_select_worker_applied" ON job_shifts;
DROP POLICY IF EXISTS "applications_select_employer_shifts" ON applications;
DROP POLICY IF EXISTS "applications_update_employer" ON applications;

-- 3. Re-create policies using the new SECURITY DEFINER functions to break the recursion

CREATE POLICY "job_shifts_select_worker_applied"
    ON job_shifts FOR SELECT
    USING (
        check_worker_applied(id, auth.uid())
    );

CREATE POLICY "applications_select_employer_shifts"
    ON applications FOR SELECT
    USING (
        check_is_employer_of_shift(shift_id, auth.uid())
    );

CREATE POLICY "applications_update_employer"
    ON applications FOR UPDATE
    USING (
        check_is_employer_of_shift(shift_id, auth.uid())
    )
    WITH CHECK (
        check_is_employer_of_shift(shift_id, auth.uid())
    );
