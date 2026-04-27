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
