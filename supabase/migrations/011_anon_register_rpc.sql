-- Allow anon to call register_user (needed when email confirmation is ON,
-- because the user has no session after signUp).
-- Security is maintained by:
--   1. p_role must be WORKER or EMPLOYER (existing check in the RPC)
--   2. p_auth_id must exist in auth.users (new check below)

-- Add existence check to the RPC
CREATE OR REPLACE FUNCTION public.register_user(
  p_auth_id        uuid,
  p_role           user_role,
  p_full_name      text default null,
  p_phone          text default null,
  p_city           text default null,
  p_county         text default null,
  p_cnp            text default null,
  p_id_card_series text default null,
  p_company_name   text default null,
  p_cui            text default null,
  p_address        text default null
) returns public.users
language plpgsql security definer set search_path = public
as $$
declare
  v_user public.users;
  v_auth_exists boolean;
begin
  -- Block privilege escalation
  if p_role not in ('WORKER', 'EMPLOYER') then
    raise exception 'Rol invalid la înregistrare.';
  end if;

  -- If caller has a session, auth_id must match it
  if auth.uid() is not null and p_auth_id <> auth.uid() then
    raise exception 'auth_id nu corespunde cu sesiunea.';
  end if;

  -- If caller has NO session (anon — email confirmation flow),
  -- verify the auth_id is a real auth user
  if auth.uid() is null then
    select exists(select 1 from auth.users where id = p_auth_id) into v_auth_exists;
    if not v_auth_exists then
      raise exception 'Auth user nu există.';
    end if;
  end if;

  -- Insert users row
  insert into public.users (auth_id, role)
  values (p_auth_id, p_role)
  returning * into v_user;

  -- Insert role-specific profile
  if p_role = 'WORKER' then
    insert into public.worker_profiles (user_id, full_name, phone_number, city, county, cnp, id_card_series)
    values (v_user.id, coalesce(p_full_name, ''), coalesce(p_phone, ''), coalesce(p_city, ''), coalesce(p_county, ''), coalesce(p_cnp, ''), coalesce(p_id_card_series, ''));
  else
    insert into public.employer_profiles (user_id, company_name, cui, address, city, county)
    values (v_user.id, coalesce(p_company_name, ''), coalesce(p_cui, ''), coalesce(p_address, ''), coalesce(p_city, ''), coalesce(p_county, ''));
  end if;

  return v_user;
end;
$$;

-- Grant anon access so the RPC works without a session
GRANT EXECUTE ON public.register_user TO anon;
GRANT EXECUTE ON public.register_user TO authenticated;
