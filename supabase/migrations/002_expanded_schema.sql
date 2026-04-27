-- ============================================================
-- GigTim — Migration 002: Expanded Schema
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

CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_REVIEW');

CREATE TYPE chat_room_type AS ENUM ('SHIFT', 'DIRECT');

CREATE TYPE forum_category AS ENUM ('GENERAL', 'TIPS', 'JOBS', 'LEGAL');

CREATE TYPE notification_type AS ENUM (
    'SHIFT_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED',
    'SHIFT_REMINDER', 'REVIEW_REQUEST', 'CHAT_MESSAGE',
    'ID_VERIFIED', 'ID_REJECTED', 'ADMIN_NOTICE'
);

-- ────────────────────────────────────────────────────────────
-- 3. Alter existing tables
-- ────────────────────────────────────────────────────────────

-- 3.1  worker_profiles: add phone, location, profile enrichment
ALTER TABLE worker_profiles
    ADD COLUMN phone_number        TEXT          NOT NULL DEFAULT '',
    ADD COLUMN city                TEXT          NOT NULL DEFAULT '',
    ADD COLUMN county              TEXT          NOT NULL DEFAULT '',
    ADD COLUMN bio                 TEXT          DEFAULT '',
    ADD COLUMN profile_picture_url TEXT          DEFAULT NULL;

COMMENT ON COLUMN worker_profiles.phone_number IS 'Romanian mobile number for contact.';
COMMENT ON COLUMN worker_profiles.city IS 'City where the worker is based (Romania-wide).';
COMMENT ON COLUMN worker_profiles.county IS 'Romanian county (județ).';

-- 3.2  employer_profiles: add location fields
ALTER TABLE employer_profiles
    ADD COLUMN city   TEXT NOT NULL DEFAULT '',
    ADD COLUMN county TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN employer_profiles.city IS 'City where the business is located.';
COMMENT ON COLUMN employer_profiles.county IS 'Romanian county (județ).';

-- ────────────────────────────────────────────────────────────
-- 4. New tables
-- ────────────────────────────────────────────────────────────

-- 4.1  ID Verifications (Persona integration)
CREATE TABLE id_verifications (
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
CREATE TABLE chat_rooms (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type       chat_room_type NOT NULL,
    shift_id   UUID REFERENCES job_shifts(id) ON DELETE SET NULL,
    name       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE chat_rooms IS 'Chat rooms — SHIFT type auto-created when application accepted, DIRECT for user-to-user.';

-- 4.3  Chat room members (N:N)
CREATE TABLE chat_room_members (
    room_id   UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

-- 4.4  Chat messages
CREATE TABLE chat_messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id    UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at  TIMESTAMPTZ
);

-- 4.5  Forum posts
CREATE TABLE forum_posts (
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
CREATE TABLE forum_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.7  Notifications
CREATE TABLE notifications (
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
CREATE TABLE reviews (
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
CREATE TABLE admin_audit_log (
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

CREATE INDEX idx_id_verifications_worker   ON id_verifications (worker_id);
CREATE INDEX idx_id_verifications_status   ON id_verifications (status);
CREATE INDEX idx_chat_messages_room        ON chat_messages (room_id, created_at);
CREATE INDEX idx_chat_room_members_user    ON chat_room_members (user_id);
CREATE INDEX idx_forum_posts_category      ON forum_posts (category, created_at DESC);
CREATE INDEX idx_forum_comments_post       ON forum_comments (post_id, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);
CREATE INDEX idx_reviews_shift             ON reviews (shift_id);
CREATE INDEX idx_reviews_reviewee          ON reviews (reviewee_id);
CREATE INDEX idx_admin_audit_log_admin     ON admin_audit_log (admin_id, created_at DESC);

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

CREATE POLICY "admin_select_all_users"
    ON users FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_all_users"
    ON users FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_select_all_worker_profiles"
    ON worker_profiles FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_all_worker_profiles"
    ON worker_profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_select_all_employer_profiles"
    ON employer_profiles FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_all_employer_profiles"
    ON employer_profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_select_all_job_shifts"
    ON job_shifts FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_all_job_shifts"
    ON job_shifts FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_select_all_applications"
    ON applications FOR SELECT USING (is_admin());
CREATE POLICY "admin_update_all_applications"
    ON applications FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- ────────────────────────────────────────────────────────────
-- 9. RLS — Policies for NEW tables
-- ────────────────────────────────────────────────────────────

-- ── 9.1  id_verifications ──────────────────────────────────

CREATE POLICY "id_verifications_select_own"
    ON id_verifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = id_verifications.worker_id
              AND users.auth_id = auth.uid()
        )
    );

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
CREATE POLICY "admin_all_id_verifications"
    ON id_verifications FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.2  chat_rooms ────────────────────────────────────────

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

CREATE POLICY "chat_rooms_insert_authenticated"
    ON chat_rooms FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_all_chat_rooms"
    ON chat_rooms FOR SELECT USING (is_admin());

-- ── 9.3  chat_room_members ─────────────────────────────────

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

CREATE POLICY "chat_room_members_insert"
    ON chat_room_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admin_all_chat_room_members"
    ON chat_room_members FOR SELECT USING (is_admin());

-- ── 9.4  chat_messages ─────────────────────────────────────

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

CREATE POLICY "admin_all_chat_messages"
    ON chat_messages FOR SELECT USING (is_admin());

-- ── 9.5  forum_posts ───────────────────────────────────────

-- All authenticated users can read posts
CREATE POLICY "forum_posts_select_all"
    ON forum_posts FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "forum_posts_insert_authenticated"
    ON forum_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_posts.author_id
              AND users.auth_id = auth.uid()
        )
    );

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
CREATE POLICY "admin_all_forum_posts"
    ON forum_posts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.6  forum_comments ────────────────────────────────────

CREATE POLICY "forum_comments_select_all"
    ON forum_comments FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "forum_comments_insert_authenticated"
    ON forum_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    );

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

CREATE POLICY "forum_comments_delete_own"
    ON forum_comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = forum_comments.author_id
              AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "admin_all_forum_comments"
    ON forum_comments FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.7  notifications ─────────────────────────────────────

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
CREATE POLICY "admin_all_notifications"
    ON notifications FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ── 9.8  reviews ───────────────────────────────────────────

CREATE POLICY "reviews_select_own"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE (users.id = reviews.reviewer_id OR users.id = reviews.reviewee_id)
              AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "reviews_insert_authenticated"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = reviews.reviewer_id
              AND users.auth_id = auth.uid()
        )
    );

CREATE POLICY "admin_all_reviews"
    ON reviews FOR SELECT USING (is_admin());

-- ── 9.9  admin_audit_log ───────────────────────────────────

CREATE POLICY "admin_audit_log_insert"
    ON admin_audit_log FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "admin_audit_log_select"
    ON admin_audit_log FOR SELECT
    USING (is_admin());

-- ============================================================
-- End of migration 002
-- ============================================================
