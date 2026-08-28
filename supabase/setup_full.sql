-- GigTim — Full Database Setup (run this in Supabase SQL Editor)
-- This creates ALL tables, policies, triggers, and the register_user RPC
-- with CNP/id_card_series as nullable (added later via profile verification)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE worker_skill AS ENUM ('BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE shift_status AS ENUM ('OPEN', 'FILLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NO_SHOW'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_REVIEW'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE chat_room_type AS ENUM ('SHIFT', 'DIRECT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE forum_category AS ENUM ('GENERAL', 'TIPS', 'JOBS', 'LEGAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('SHIFT_APPLICATION','APPLICATION_ACCEPTED','APPLICATION_REJECTED','SHIFT_REMINDER','REVIEW_REQUEST','CHAT_MESSAGE','ID_VERIFIED','ID_REJECTED','ADMIN_NOTICE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role       user_role    NOT NULL,
    auth_id    UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worker_profiles (
    user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name              TEXT          NOT NULL DEFAULT '',
    cnp                    TEXT          DEFAULT NULL,
    id_card_series         TEXT          DEFAULT NULL,
    phone_number           TEXT          NOT NULL DEFAULT '',
    city                   TEXT          NOT NULL DEFAULT '',
    county                 TEXT          NOT NULL DEFAULT '',
    bio                    TEXT          DEFAULT '',
    reliability_score      NUMERIC(2,1)  NOT NULL DEFAULT 0.0 CHECK (reliability_score >= 0.0 AND reliability_score <= 5.0),
    total_shifts_completed INT           NOT NULL DEFAULT 0 CHECK (total_shifts_completed >= 0),
    skills                 worker_skill[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name    TEXT          NOT NULL DEFAULT '',
    cui             TEXT          NOT NULL DEFAULT '',
    address         TEXT          NOT NULL DEFAULT '',
    city            TEXT          NOT NULL DEFAULT '',
    county          TEXT          NOT NULL DEFAULT '',
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    employer_rating NUMERIC(2,1)  DEFAULT NULL CHECK (employer_rating IS NULL OR (employer_rating >= 0.0 AND employer_rating <= 5.0))
);

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

CREATE TABLE IF NOT EXISTS applications (
    id         UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id   UUID               NOT NULL REFERENCES job_shifts(id) ON DELETE CASCADE,
    worker_id  UUID               NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    status     application_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ        NOT NULL DEFAULT now(),
    CONSTRAINT unique_application UNIQUE (shift_id, worker_id)
);

CREATE TABLE IF NOT EXISTS chat_rooms (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type       chat_room_type NOT NULL,
    shift_id   UUID REFERENCES job_shifts(id) ON DELETE SET NULL,
    name       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_room_members (
    room_id   UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id    UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at  TIMESTAMPTZ
);

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

CREATE TABLE IF NOT EXISTS forum_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id    UUID NOT NULL REFERENCES job_shifts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_shift_review UNIQUE (shift_id, reviewer_id),
    CONSTRAINT prevent_self_review CHECK (reviewer_id != reviewee_id)
);

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_shifts_status_start ON job_shifts (status, start_time);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_location ON employer_profiles (lat, lng);
CREATE INDEX IF NOT EXISTS idx_applications_shift  ON applications (shift_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications (worker_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room     ON chat_messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user  ON chat_room_members (user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category    ON forum_posts (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post     ON forum_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_shift           ON reviews (shift_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee        ON reviews (reviewee_id);

-- Enable RLS on all tables
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_shifts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verifications   ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies
-- users
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = auth_id);
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);
DROP POLICY IF EXISTS "admin_all_users" ON users;
CREATE POLICY "admin_all_users" ON users FOR SELECT USING (is_admin());

-- worker_profiles
DROP POLICY IF EXISTS "worker_profiles_select_own" ON worker_profiles;
CREATE POLICY "worker_profiles_select_own" ON worker_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "worker_profiles_select_employers" ON worker_profiles;
CREATE POLICY "worker_profiles_select_employers" ON worker_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'EMPLOYER')
);
DROP POLICY IF EXISTS "worker_profiles_insert_own" ON worker_profiles;
CREATE POLICY "worker_profiles_insert_own" ON worker_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid() AND users.role = 'WORKER')
);
DROP POLICY IF EXISTS "worker_profiles_update_own" ON worker_profiles;
CREATE POLICY "worker_profiles_update_own" ON worker_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid())
);

-- employer_profiles
DROP POLICY IF EXISTS "employer_profiles_select_own" ON employer_profiles;
CREATE POLICY "employer_profiles_select_own" ON employer_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "employer_profiles_select_workers" ON employer_profiles;
CREATE POLICY "employer_profiles_select_workers" ON employer_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'WORKER')
);
DROP POLICY IF EXISTS "employer_profiles_insert_own" ON employer_profiles;
CREATE POLICY "employer_profiles_insert_own" ON employer_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid() AND users.role = 'EMPLOYER')
);
DROP POLICY IF EXISTS "employer_profiles_update_own" ON employer_profiles;
CREATE POLICY "employer_profiles_update_own" ON employer_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid())
);

-- job_shifts
DROP POLICY IF EXISTS "job_shifts_select_open" ON job_shifts;
CREATE POLICY "job_shifts_select_open" ON job_shifts FOR SELECT USING (status = 'OPEN');
DROP POLICY IF EXISTS "job_shifts_select_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_select_employer_own" ON job_shifts FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id)
);
DROP POLICY IF EXISTS "job_shifts_insert_employer" ON job_shifts;
CREATE POLICY "job_shifts_insert_employer" ON job_shifts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id AND users.role = 'EMPLOYER')
);
DROP POLICY IF EXISTS "job_shifts_update_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_update_employer_own" ON job_shifts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id)
) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id)
);

-- applications
DROP POLICY IF EXISTS "applications_select_worker_own" ON applications;
CREATE POLICY "applications_select_worker_own" ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = applications.worker_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "applications_select_employer" ON applications;
CREATE POLICY "applications_select_employer" ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "applications_insert_worker" ON applications;
CREATE POLICY "applications_insert_worker" ON applications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = applications.worker_id AND users.auth_id = auth.uid() AND users.role = 'WORKER')
);
DROP POLICY IF EXISTS "applications_update_employer" ON applications;
CREATE POLICY "applications_update_employer" ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid())
);

-- chat_rooms (any authenticated user can SELECT — fixes chicken-and-egg)
DROP POLICY IF EXISTS "chat_rooms_select_authenticated" ON chat_rooms;
CREATE POLICY "chat_rooms_select_authenticated" ON chat_rooms FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "chat_rooms_insert_authenticated" ON chat_rooms;
CREATE POLICY "chat_rooms_insert_authenticated" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- chat_room_members
DROP POLICY IF EXISTS "chat_room_members_select_member" ON chat_room_members;
CREATE POLICY "chat_room_members_select_member" ON chat_room_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = chat_room_members.user_id AND users.auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM chat_room_members crm JOIN users ON users.id = crm.user_id WHERE crm.room_id = chat_room_members.room_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "chat_room_members_insert" ON chat_room_members;
CREATE POLICY "chat_room_members_insert" ON chat_room_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- chat_messages
DROP POLICY IF EXISTS "chat_messages_select_member" ON chat_messages;
CREATE POLICY "chat_messages_select_member" ON chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_room_members JOIN users ON users.id = chat_room_members.user_id WHERE chat_room_members.room_id = chat_messages.room_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "chat_messages_insert_member" ON chat_messages;
CREATE POLICY "chat_messages_insert_member" ON chat_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chat_room_members JOIN users ON users.id = chat_room_members.user_id WHERE chat_room_members.room_id = chat_messages.room_id AND users.auth_id = auth.uid() AND users.id = chat_messages.sender_id)
);

-- forum_posts
DROP POLICY IF EXISTS "forum_posts_select_all" ON forum_posts;
CREATE POLICY "forum_posts_select_all" ON forum_posts FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "forum_posts_insert_authenticated" ON forum_posts;
CREATE POLICY "forum_posts_insert_authenticated" ON forum_posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "forum_posts_update_own" ON forum_posts;
CREATE POLICY "forum_posts_update_own" ON forum_posts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "forum_posts_delete_own" ON forum_posts;
CREATE POLICY "forum_posts_delete_own" ON forum_posts FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid())
);

-- forum_comments
DROP POLICY IF EXISTS "forum_comments_select_all" ON forum_comments;
CREATE POLICY "forum_comments_select_all" ON forum_comments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "forum_comments_insert_authenticated" ON forum_comments;
CREATE POLICY "forum_comments_insert_authenticated" ON forum_comments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = forum_comments.author_id AND users.auth_id = auth.uid())
);

-- notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = notifications.user_id AND users.auth_id = auth.uid())
);
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = notifications.user_id AND users.auth_id = auth.uid())
);

-- reviews
DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_insert_eligible" ON reviews;
CREATE POLICY "reviews_insert_eligible" ON reviews FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM users WHERE id = reviewer_id)
);

-- id_verifications
DROP POLICY IF EXISTS "id_verifications_select_own" ON id_verifications;
CREATE POLICY "id_verifications_select_own" ON id_verifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = id_verifications.worker_id AND users.auth_id = auth.uid())
);

-- register_user RPC (callable by anon for email-confirmation flow)
CREATE OR REPLACE FUNCTION public.register_user(
  p_auth_id        uuid,
  p_role           user_role,
  p_full_name      text default null,
  p_phone          text default null,
  p_city           text default null,
  p_county         text default null,
  p_cnp            text default null,
  p_id_card_series text default null,
  p_company_name   text default null,
  p_cui            text default null,
  p_address        text default null
) returns public.users
language plpgsql security definer set search_path = public
as $$
declare
  v_user public.users;
  v_auth_exists boolean;
begin
  if p_role not in ('WORKER', 'EMPLOYER') then
    raise exception 'Rol invalid la înregistrare.';
  end if;
  if auth.uid() is not null and p_auth_id <> auth.uid() then
    raise exception 'auth_id nu corespunde cu sesiunea.';
  end if;
  if auth.uid() is null then
    select exists(select 1 from auth.users where id = p_auth_id) into v_auth_exists;
    if not v_auth_exists then
      raise exception 'Auth user nu există.';
    end if;
  end if;
  insert into public.users (auth_id, role) values (p_auth_id, p_role) returning * into v_user;
  if p_role = 'WORKER' then
    insert into public.worker_profiles (user_id, full_name, phone_number, city, county, cnp, id_card_series)
    values (v_user.id, coalesce(p_full_name, ''), coalesce(p_phone, ''), coalesce(p_city, ''), coalesce(p_county, ''), p_cnp, p_id_card_series);
  else
    insert into public.employer_profiles (user_id, company_name, cui, address, city, county)
    values (v_user.id, coalesce(p_company_name, ''), coalesce(p_cui, ''), coalesce(p_address, ''), coalesce(p_city, ''), coalesce(p_county, ''));
  end if;
  return v_user;
end;
$$;
GRANT EXECUTE ON public.register_user TO anon;
GRANT EXECUTE ON public.register_user TO authenticated;

-- Chat trigger: auto-create room when application accepted
CREATE OR REPLACE FUNCTION create_chat_on_accept()
RETURNS TRIGGER AS $$
DECLARE
    new_room_id UUID;
    v_employer_id UUID;
    v_employer_name TEXT;
    v_worker_name TEXT;
BEGIN
    IF NEW.status = 'ACCEPTED' AND OLD.status != 'ACCEPTED' THEN
        SELECT employer_id INTO v_employer_id FROM job_shifts WHERE id = NEW.shift_id;
        SELECT company_name INTO v_employer_name FROM employer_profiles WHERE user_id = v_employer_id;
        SELECT full_name INTO v_worker_name FROM worker_profiles WHERE user_id = NEW.worker_id;
        INSERT INTO chat_rooms (type, shift_id, name) VALUES ('SHIFT', NEW.shift_id, v_employer_name || ' & ' || v_worker_name) RETURNING id INTO new_room_id;
        INSERT INTO chat_room_members (room_id, user_id) VALUES (new_room_id, v_employer_id);
        INSERT INTO chat_room_members (room_id, user_id) VALUES (new_room_id, NEW.worker_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_create_chat_on_accept ON applications;
CREATE TRIGGER trigger_create_chat_on_accept AFTER UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION create_chat_on_accept();

-- Chat notification trigger
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    room_member_id UUID;
    sender_name TEXT;
BEGIN
    SELECT full_name INTO sender_name FROM worker_profiles WHERE user_id = NEW.sender_id;
    IF sender_name IS NULL THEN
        SELECT company_name INTO sender_name FROM employer_profiles WHERE user_id = NEW.sender_id;
    END IF;
    IF sender_name IS NULL THEN sender_name := 'Utilizator'; END IF;
    FOR room_member_id IN SELECT user_id FROM chat_room_members WHERE room_id = NEW.room_id AND user_id != NEW.sender_id LOOP
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES (room_member_id, 'CHAT_MESSAGE', 'Mesaj nou de la ' || sender_name,
            substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END,
            jsonb_build_object('room_id', NEW.room_id, 'message_id', NEW.id));
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON chat_messages;
CREATE TRIGGER trigger_notify_chat_message AFTER INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION notify_chat_message();

-- Review eligibility trigger
CREATE OR REPLACE FUNCTION check_review_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    v_shift_status shift_status;
    v_employer_id UUID;
    v_accepted_worker_id UUID;
BEGIN
    SELECT status, employer_id INTO v_shift_status, v_employer_id FROM job_shifts WHERE id = NEW.shift_id;
    IF v_shift_status != 'COMPLETED' THEN RAISE EXCEPTION 'Tură nefinalizată.'; END IF;
    SELECT worker_id INTO v_accepted_worker_id FROM applications WHERE shift_id = NEW.shift_id AND status = 'ACCEPTED' LIMIT 1;
    IF NEW.reviewer_id != v_employer_id AND NEW.reviewer_id != v_accepted_worker_id THEN
        RAISE EXCEPTION 'Neautorizat.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS enforce_review_rules ON reviews;
CREATE TRIGGER enforce_review_rules BEFORE INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION check_review_eligibility();

-- Rating update trigger
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE v_role user_role; v_avg NUMERIC(2,1);
BEGIN
    SELECT ROUND(AVG(rating)::numeric, 1) INTO v_avg FROM reviews WHERE reviewee_id = NEW.reviewee_id;
    SELECT role INTO v_role FROM users WHERE id = NEW.reviewee_id;
    IF v_role = 'WORKER' THEN UPDATE worker_profiles SET reliability_score = v_avg WHERE user_id = NEW.reviewee_id;
    ELSIF v_role = 'EMPLOYER' THEN UPDATE employer_profiles SET employer_rating = v_avg WHERE user_id = NEW.reviewee_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS update_profile_rating ON reviews;
CREATE TRIGGER update_profile_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_average_rating();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can upload their own avatars." ON storage.objects;
CREATE POLICY "Users can upload their own avatars." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users can update their own avatars." ON storage.objects;
CREATE POLICY "Users can update their own avatars." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Users can delete their own avatars." ON storage.objects;
CREATE POLICY "Users can delete their own avatars." ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Done!
