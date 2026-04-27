-- ============================================================
-- GigTim — Migration 003: Chat Triggers
-- Adds database triggers for Chat Notifications
-- ============================================================

-- Function to create a notification for chat messages
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    room_member_id UUID;
    sender_name TEXT;
BEGIN
    -- Get the sender's name (try worker first, then employer)
    SELECT full_name INTO sender_name FROM worker_profiles WHERE user_id = NEW.sender_id;
    IF sender_name IS NULL THEN
        SELECT company_name INTO sender_name FROM employer_profiles WHERE user_id = NEW.sender_id;
    END IF;
    
    IF sender_name IS NULL THEN
        sender_name := 'Utilizator';
    END IF;

    -- Insert a notification for every member of the room EXCEPT the sender
    FOR room_member_id IN
        SELECT user_id FROM chat_room_members WHERE room_id = NEW.room_id AND user_id != NEW.sender_id
    LOOP
        INSERT INTO notifications (user_id, type, title, body, data)
        VALUES (
            room_member_id,
            'CHAT_MESSAGE',
            'Mesaj nou de la ' || sender_name,
            substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END,
            jsonb_build_object('room_id', NEW.room_id, 'message_id', NEW.id)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a message is inserted
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON chat_messages;
CREATE TRIGGER trigger_notify_chat_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION notify_chat_message();
