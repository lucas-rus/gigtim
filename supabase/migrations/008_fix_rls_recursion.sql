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
