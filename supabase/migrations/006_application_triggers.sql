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
