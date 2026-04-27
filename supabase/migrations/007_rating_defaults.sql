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
