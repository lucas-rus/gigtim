-- CHUNK 3: RLS Policies
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = auth_id);
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);
DROP POLICY IF EXISTS "admin_all_users" ON users;
CREATE POLICY "admin_all_users" ON users FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "worker_profiles_select_own" ON worker_profiles;
CREATE POLICY "worker_profiles_select_own" ON worker_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "worker_profiles_select_employers" ON worker_profiles;
CREATE POLICY "worker_profiles_select_employers" ON worker_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'EMPLOYER'));
DROP POLICY IF EXISTS "worker_profiles_insert_own" ON worker_profiles;
CREATE POLICY "worker_profiles_insert_own" ON worker_profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid() AND users.role = 'WORKER'));
DROP POLICY IF EXISTS "worker_profiles_update_own" ON worker_profiles;
CREATE POLICY "worker_profiles_update_own" ON worker_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = worker_profiles.user_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "employer_profiles_select_own" ON employer_profiles;
CREATE POLICY "employer_profiles_select_own" ON employer_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "employer_profiles_select_workers" ON employer_profiles;
CREATE POLICY "employer_profiles_select_workers" ON employer_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.role = 'WORKER'));
DROP POLICY IF EXISTS "employer_profiles_insert_own" ON employer_profiles;
CREATE POLICY "employer_profiles_insert_own" ON employer_profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid() AND users.role = 'EMPLOYER'));
DROP POLICY IF EXISTS "employer_profiles_update_own" ON employer_profiles;
CREATE POLICY "employer_profiles_update_own" ON employer_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = employer_profiles.user_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "job_shifts_select_open" ON job_shifts;
CREATE POLICY "job_shifts_select_open" ON job_shifts FOR SELECT USING (status = 'OPEN');
DROP POLICY IF EXISTS "job_shifts_select_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_select_employer_own" ON job_shifts FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id));
DROP POLICY IF EXISTS "job_shifts_insert_employer" ON job_shifts;
CREATE POLICY "job_shifts_insert_employer" ON job_shifts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id AND users.role = 'EMPLOYER'));
DROP POLICY IF EXISTS "job_shifts_update_employer_own" ON job_shifts;
CREATE POLICY "job_shifts_update_employer_own" ON job_shifts FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id)) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.auth_id = auth.uid() AND users.id = job_shifts.employer_id));

DROP POLICY IF EXISTS "applications_select_worker_own" ON applications;
CREATE POLICY "applications_select_worker_own" ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = applications.worker_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "applications_select_employer" ON applications;
CREATE POLICY "applications_select_employer" ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "applications_insert_worker" ON applications;
CREATE POLICY "applications_insert_worker" ON applications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = applications.worker_id AND users.auth_id = auth.uid() AND users.role = 'WORKER'));
DROP POLICY IF EXISTS "applications_update_employer" ON applications;
CREATE POLICY "applications_update_employer" ON applications FOR UPDATE USING (EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM job_shifts JOIN users ON users.id = job_shifts.employer_id WHERE job_shifts.id = applications.shift_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "chat_rooms_select_authenticated" ON chat_rooms;
CREATE POLICY "chat_rooms_select_authenticated" ON chat_rooms FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "chat_rooms_insert_authenticated" ON chat_rooms;
CREATE POLICY "chat_rooms_insert_authenticated" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "chat_room_members_select_member" ON chat_room_members;
CREATE POLICY "chat_room_members_select_member" ON chat_room_members FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = chat_room_members.user_id AND users.auth_id = auth.uid()) OR EXISTS (SELECT 1 FROM chat_room_members crm JOIN users ON users.id = crm.user_id WHERE crm.room_id = chat_room_members.room_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "chat_room_members_insert" ON chat_room_members;
CREATE POLICY "chat_room_members_insert" ON chat_room_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "chat_messages_select_member" ON chat_messages;
CREATE POLICY "chat_messages_select_member" ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM chat_room_members JOIN users ON users.id = chat_room_members.user_id WHERE chat_room_members.room_id = chat_messages.room_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "chat_messages_insert_member" ON chat_messages;
CREATE POLICY "chat_messages_insert_member" ON chat_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM chat_room_members JOIN users ON users.id = chat_room_members.user_id WHERE chat_room_members.room_id = chat_messages.room_id AND users.auth_id = auth.uid() AND users.id = chat_messages.sender_id));

DROP POLICY IF EXISTS "forum_posts_select_all" ON forum_posts;
CREATE POLICY "forum_posts_select_all" ON forum_posts FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "forum_posts_insert_authenticated" ON forum_posts;
CREATE POLICY "forum_posts_insert_authenticated" ON forum_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "forum_posts_update_own" ON forum_posts;
CREATE POLICY "forum_posts_update_own" ON forum_posts FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "forum_posts_delete_own" ON forum_posts;
CREATE POLICY "forum_posts_delete_own" ON forum_posts FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE users.id = forum_posts.author_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "forum_comments_select_all" ON forum_comments;
CREATE POLICY "forum_comments_select_all" ON forum_comments FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "forum_comments_insert_authenticated" ON forum_comments;
CREATE POLICY "forum_comments_insert_authenticated" ON forum_comments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = forum_comments.author_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = notifications.user_id AND users.auth_id = auth.uid()));
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = notifications.user_id AND users.auth_id = auth.uid()));

DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_insert_eligible" ON reviews;
CREATE POLICY "reviews_insert_eligible" ON reviews FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = reviewer_id));

DROP POLICY IF EXISTS "id_verifications_select_own" ON id_verifications;
CREATE POLICY "id_verifications_select_own" ON id_verifications FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = id_verifications.worker_id AND users.auth_id = auth.uid()));
