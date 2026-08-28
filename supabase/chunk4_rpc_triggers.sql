-- CHUNK 4: register_user RPC + triggers + storage
CREATE OR REPLACE FUNCTION public.register_user(
  p_auth_id uuid, p_role user_role,
  p_full_name text default null, p_phone text default null,
  p_city text default null, p_county text default null,
  p_cnp text default null, p_id_card_series text default null,
  p_company_name text default null, p_cui text default null, p_address text default null
) returns public.users
language plpgsql security definer set search_path = public
as $$
declare v_user public.users; v_auth_exists boolean;
begin
  if p_role not in ('WORKER', 'EMPLOYER') then raise exception 'Rol invalid.'; end if;
  if auth.uid() is not null and p_auth_id <> auth.uid() then raise exception 'auth_id mismatch.'; end if;
  if auth.uid() is null then
    select exists(select 1 from auth.users where id = p_auth_id) into v_auth_exists;
    if not v_auth_exists then raise exception 'Auth user nu există.'; end if;
  end if;
  insert into public.users (auth_id, role) values (p_auth_id, p_role) returning * into v_user;
  if p_role = 'WORKER' then
    insert into public.worker_profiles (user_id, full_name, phone_number, city, county, cnp, id_card_series)
    values (v_user.id, coalesce(p_full_name,''), coalesce(p_phone,''), coalesce(p_city,''), coalesce(p_county,''), p_cnp, p_id_card_series);
  else
    insert into public.employer_profiles (user_id, company_name, cui, address, city, county)
    values (v_user.id, coalesce(p_company_name,''), coalesce(p_cui,''), coalesce(p_address,''), coalesce(p_city,''), coalesce(p_county,''));
  end if;
  return v_user;
end;
$$;
GRANT EXECUTE ON public.register_user TO anon;
GRANT EXECUTE ON public.register_user TO authenticated;

CREATE OR REPLACE FUNCTION create_chat_on_accept()
RETURNS TRIGGER AS $$
DECLARE new_room_id UUID; v_employer_id UUID; v_employer_name TEXT; v_worker_name TEXT;
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

CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE room_member_id UUID; sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM worker_profiles WHERE user_id = NEW.sender_id;
  IF sender_name IS NULL THEN SELECT company_name INTO sender_name FROM employer_profiles WHERE user_id = NEW.sender_id; END IF;
  IF sender_name IS NULL THEN sender_name := 'Utilizator'; END IF;
  FOR room_member_id IN SELECT user_id FROM chat_room_members WHERE room_id = NEW.room_id AND user_id != NEW.sender_id LOOP
    INSERT INTO notifications (user_id, type, title, body, data) VALUES (room_member_id, 'CHAT_MESSAGE', 'Mesaj nou de la ' || sender_name, substring(NEW.content from 1 for 50) || CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END, jsonb_build_object('room_id', NEW.room_id, 'message_id', NEW.id));
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON chat_messages;
CREATE TRIGGER trigger_notify_chat_message AFTER INSERT ON chat_messages FOR EACH ROW EXECUTE FUNCTION notify_chat_message();

CREATE OR REPLACE FUNCTION check_review_eligibility()
RETURNS TRIGGER AS $$
DECLARE v_shift_status shift_status; v_employer_id UUID; v_accepted_worker_id UUID;
BEGIN
  SELECT status, employer_id INTO v_shift_status, v_employer_id FROM job_shifts WHERE id = NEW.shift_id;
  IF v_shift_status != 'COMPLETED' THEN RAISE EXCEPTION 'Tură nefinalizată.'; END IF;
  SELECT worker_id INTO v_accepted_worker_id FROM applications WHERE shift_id = NEW.shift_id AND status = 'ACCEPTED' LIMIT 1;
  IF NEW.reviewer_id != v_employer_id AND NEW.reviewer_id != v_accepted_worker_id THEN RAISE EXCEPTION 'Neautorizat.'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS enforce_review_rules ON reviews;
CREATE TRIGGER enforce_review_rules BEFORE INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION check_review_eligibility();

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
