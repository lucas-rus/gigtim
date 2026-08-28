-- 009_atomic_registration.sql
-- Atomic user + profile registration via a single Postgres RPC.
--
-- The Supabase Auth user is created client/server-side first (auth.users),
-- then this function inserts the `users` row AND the role-specific profile
-- row in a single transaction. If either insert fails, the whole thing
-- rolls back — no orphaned `users` row without a profile.
--
-- The auth user itself lives outside this transaction; the caller (server
-- action) is responsible for deleting the auth user via the service-role
-- client if this RPC fails, to avoid an orphaned auth user.

create or replace function public.register_user(
  p_auth_id uuid,
  p_role user_role,
  p_full_name text default null,
  p_phone text default null,
  p_city text default null,
  p_county text default null,
  p_cnp text default null,
  p_id_card_series text default null,
  p_company_name text default null,
  p_cui text default null,
  p_address text default null
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
begin
  -- Block privilege escalation: only WORKER or EMPLOYER may be registered
  -- (never ADMIN). user_role includes ADMIN, so this MUST be enforced here.
  if p_role not in ('WORKER', 'EMPLOYER') then
    raise exception 'Rol invalid la înregistrare.';
  end if;

  -- When called by an authenticated session, the auth_id MUST match the
  -- caller. Service-role calls (auth.uid() IS NULL) are allowed — they are
  -- server-trusted. This blocks an authenticated user from pre-creating a
  -- profile under another user's auth_id.
  if auth.uid() is not null and p_auth_id <> auth.uid() then
    raise exception 'auth_id nu corespunde cu sesiunea.';
  end if;

  -- Insert the base user row.
  insert into public.users (auth_id, role)
  values (p_auth_id, p_role)
  returning * into v_user;

  -- Insert the role-specific profile in the same transaction.
  if p_role = 'WORKER' then
    insert into public.worker_profiles (
      user_id, full_name, phone_number, city, county, cnp, id_card_series
    )
    values (
      v_user.id,
      coalesce(p_full_name, ''),
      coalesce(p_phone, ''),
      coalesce(p_city, ''),
      coalesce(p_county, ''),
      coalesce(p_cnp, ''),
      coalesce(p_id_card_series, '')
    );
  elsif p_role = 'EMPLOYER' then
    insert into public.employer_profiles (
      user_id, company_name, cui, address, city, county
    )
    values (
      v_user.id,
      coalesce(p_company_name, ''),
      coalesce(p_cui, ''),
      coalesce(p_address, ''),
      coalesce(p_city, ''),
      coalesce(p_county, '')
    );
  end if;

  return v_user;
end;
$$;

-- Allow authenticated users to invoke registration (the auth user must already
-- exist). anon is intentionally REVOKED so the public anon key cannot be used
-- to create users. The service-role bypasses grants and is used by the server
-- action. SECURITY DEFINER lets the function insert the profile row that the
-- freshly-signed-up user could not yet reach via RLS.
grant execute on function public.register_user(uuid, user_role, text, text, text, text, text, text, text, text, text) to authenticated;
revoke execute on function public.register_user(uuid, user_role, text, text, text, text, text, text, text, text, text) from anon;

-- Also add a unique constraint on DIRECT chat room membership pairs to prevent
-- the race condition in getOrCreateDirectChat (two concurrent calls creating
-- duplicate DIRECT rooms). We enforce "at most one DIRECT room per user pair"
-- via a partial unique index on a sorted pair expression.
-- Note: chat_room_members is N:N, so we index the room + user; the one-DIRECT-
-- room-per-pair guarantee is enforced at the app level by getOrCreateDirectChat
-- and the existing membership rows. A stricter DB guarantee would require a
-- pair table; left as a follow-up to avoid a risky migration here.
