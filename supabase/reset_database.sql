-- GigTim Database Reset Script
-- Run this in the Supabase SQL Editor to delete ALL user data and start fresh.
-- This truncates every table that contains user-generated data.
-- Table structures, RLS policies, triggers, and functions are preserved.

-- Disable RLS temporarily to avoid policy conflicts during truncate
SET session_replication_role = 'replica';

-- Truncate all user-data tables (CASCADE handles foreign key dependencies)
TRUNCATE TABLE
  chat_messages,
  chat_room_members,
  chat_rooms,
  reviews,
  forum_comments,
  forum_posts,
  applications,
  job_shifts,
  worker_profiles,
  employer_profiles,
  users
CASCADE;

-- Re-enable RLS
SET session_replication_role = 'origin';

-- Verify: all tables should be empty
SELECT 'users' as table_name, count(*) as rows FROM users
UNION ALL SELECT 'worker_profiles', count(*) FROM worker_profiles
UNION ALL SELECT 'employer_profiles', count(*) FROM employer_profiles
UNION ALL SELECT 'job_shifts', count(*) FROM job_shifts
UNION ALL SELECT 'applications', count(*) FROM applications
UNION ALL SELECT 'chat_rooms', count(*) FROM chat_rooms
UNION ALL SELECT 'reviews', count(*) FROM reviews
UNION ALL SELECT 'forum_posts', count(*) FROM forum_posts;
