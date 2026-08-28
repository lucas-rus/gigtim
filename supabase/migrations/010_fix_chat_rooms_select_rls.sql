-- Fix chat_rooms SELECT RLS policy — chicken-and-egg problem:
-- chat_rooms_select_member requires membership to SELECT a room,
-- but after INSERT the user isn't a member yet, so .insert().select() fails.
-- Fix: allow any authenticated user to SELECT chat_rooms (metadata only —
-- actual message content is still protected by chat_messages RLS).

DROP POLICY IF EXISTS "chat_rooms_select_member" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_select_authenticated" ON chat_rooms;

CREATE POLICY "chat_rooms_select_authenticated"
    ON chat_rooms FOR SELECT
    USING (auth.uid() IS NOT NULL);
