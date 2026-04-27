-- ============================================================
-- GigTim — Initial Database Schema
-- Supabase (PostgreSQL) migration
-- PRD reference: GigApp_PRD.md §4 "Database Schema"
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. Custom ENUM types
-- ────────────────────────────────────────────────────────────

-- User role (WORKER or EMPLOYER)
CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER');

-- Worker skill set
CREATE TYPE worker_skill AS ENUM ('BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND');

-- Shift lifecycle status
CREATE TYPE shift_status AS ENUM ('OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Application status
CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NO_SHOW');

-- ────────────────────────────────────────────────────────────
-- 2. Tables
-- ────────────────────────────────────────────────────────────

-- 2.1  Users (base table, linked to Supabase Auth)
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role       user_role    NOT NULL,
    auth_id    UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users IS 'Base user record — every authenticated person has exactly one row.';
COMMENT ON COLUMN users.auth_id IS 'FK → Supabase auth.users. One-to-one mapping.';

-- 2.2  Worker Profiles
CREATE TABLE worker_profiles (
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
CREATE TABLE employer_profiles (
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
CREATE TABLE job_shifts (
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
CREATE TABLE applications (
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
CREATE INDEX idx_job_shifts_status_start ON job_shifts (status, start_time);

-- Geo queries: allow PostGIS-less bounding-box filtering on lat/lng
CREATE INDEX idx_employer_profiles_location ON employer_profiles (lat, lng);

-- Application queries per shift and per worker
CREATE INDEX idx_applications_shift  ON applications (shift_id);
CREATE INDEX idx_applications_worker ON applications (worker_id);

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
CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

-- Users can update their own row (role changes are NOT allowed via app —
-- enforce at the application layer; here we allow the row owner only).
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);

-- Insert is done via a server-side trigger / Edge Function on sign-up.
-- We still allow authenticated insert so the sign-up flow works.
CREATE POLICY "users_insert_own"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = auth_id);

-- ── 4.2  worker_profiles ──────────────────────────────────

-- Workers can read their own profile
CREATE POLICY "worker_profiles_select_own"
    ON worker_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = worker_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- Employers can read worker profiles (needed to view applicants & ITM data)
CREATE POLICY "worker_profiles_select_employers"
    ON worker_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.role = 'EMPLOYER'
        )
    );

-- Workers can insert their own profile
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

-- Workers can update their own profile
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

-- Employer can read their own profile
CREATE POLICY "employer_profiles_select_own"
    ON employer_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = employer_profiles.user_id
              AND users.auth_id = auth.uid()
        )
    );

-- Workers can view employer profiles (needed for shift details / company info)
CREATE POLICY "employer_profiles_select_workers"
    ON employer_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.role = 'WORKER'
        )
    );

-- Employers can insert their own profile
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

-- Employers can update their own profile
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

-- Anyone authenticated can view OPEN shifts (workers browsing the map)
CREATE POLICY "job_shifts_select_open"
    ON job_shifts FOR SELECT
    USING (status = 'OPEN');

-- Employers can see ALL their own shifts (any status)
CREATE POLICY "job_shifts_select_employer_own"
    ON job_shifts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_id = auth.uid()
              AND users.id = job_shifts.employer_id
        )
    );

-- Workers can see shifts they have applied to (any status)
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

-- Employers can insert shifts
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

-- Employers can update their own shifts (change status, etc.)
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

-- Workers can see their own applications
CREATE POLICY "applications_select_worker_own"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = applications.worker_id
              AND users.auth_id = auth.uid()
        )
    );

-- Employers can see applications for their shifts
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

-- Workers can insert applications (apply to a shift)
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

-- Employers can update applications for their own shifts (accept/reject)
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
