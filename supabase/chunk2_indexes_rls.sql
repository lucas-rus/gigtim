-- CHUNK 2: Indexes + RLS + helper function
CREATE INDEX IF NOT EXISTS idx_job_shifts_status_start ON job_shifts (status, start_time);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_location ON employer_profiles (lat, lng);
CREATE INDEX IF NOT EXISTS idx_applications_shift ON applications (shift_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications (worker_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members (user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_shift ON reviews (shift_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews (reviewee_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;
