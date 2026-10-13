-- PJ // ADMIN AUTH v3 (phone-free)
-- Permanent owner account + password + private Admin Key.
-- Run AFTER pj-network-v4.sql.
--
-- Admin actions require BOTH:
--   1) the signed-in Supabase Auth user is listed in public.site_admins
--   2) THIS exact Supabase session has verified the private Admin Key recently
--
-- No QR code, phone, TOTP, OTP, service-role key, or database password is used here.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists private.pj_admin_secrets (
  id smallint primary key default 1 check (id = 1),
  secret_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.pj_admin_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  verified_until timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

create table if not exists private.pj_admin_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  failures integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, session_id)
);

revoke all on table private.pj_admin_secrets from public, anon, authenticated;
revoke all on table private.pj_admin_sessions from public, anon, authenticated;
revoke all on table private.pj_admin_attempts from public, anon, authenticated;

create or replace function private.pj_is_admin_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from public.site_admins a
    where a.user_id = (select auth.uid())
  );
$$;

create or replace function private.pj_admin_session_id()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif((select auth.jwt() ->> 'session_id'), '');
$$;

create or replace function private.pj_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.pj_is_admin_account()
    and private.pj_admin_session_id() is not null
    and exists(
      select 1
      from private.pj_admin_sessions s
      where s.user_id = (select auth.uid())
        and s.session_id = private.pj_admin_session_id()
        and s.verified_until > now()
    );
$$;

revoke all on function private.pj_is_admin_account() from public;
revoke all on function private.pj_admin_session_id() from public;
revoke all on function private.pj_is_admin() from public;
grant execute on function private.pj_is_admin_account() to authenticated;
grant execute on function private.pj_admin_session_id() to authenticated;
grant execute on function private.pj_is_admin() to authenticated;

-- Browser RPC: verifies the private key without ever exposing the stored hash.
-- Five bad attempts lock this signed-in session for 15 minutes.
create or replace function public.pj_admin_stepup(p_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  sid text := nullif((select auth.jwt() ->> 'session_id'), '');
  stored_hash text;
  attempts private.pj_admin_attempts%rowtype;
  next_failures integer;
begin
  if uid is null or sid is null or not private.pj_is_admin_account() then
    return false;
  end if;

  if p_key is null or char_length(p_key) < 12 or char_length(p_key) > 200 then
    return false;
  end if;

  select * into attempts
  from private.pj_admin_attempts
  where user_id = uid and session_id = sid;

  if found and attempts.locked_until is not null and attempts.locked_until > now() then
    return false;
  end if;

  select secret_hash into stored_hash
  from private.pj_admin_secrets
  where id = 1;

  if stored_hash is null then
    return false;
  end if;

  if crypt(p_key, stored_hash) = stored_hash then
    delete from private.pj_admin_attempts
    where user_id = uid and session_id = sid;

    insert into private.pj_admin_sessions(user_id, session_id, verified_until)
    values(uid, sid, now() + interval '30 minutes')
    on conflict(user_id, session_id) do update
      set verified_until = excluded.verified_until,
          created_at = now();
    return true;
  end if;

  next_failures := coalesce(attempts.failures, 0) + 1;
  insert into private.pj_admin_attempts(user_id, session_id, failures, locked_until, updated_at)
  values(
    uid,
    sid,
    next_failures,
    case when next_failures >= 5 then now() + interval '15 minutes' else null end,
    now()
  )
  on conflict(user_id, session_id) do update
    set failures = excluded.failures,
        locked_until = excluded.locked_until,
        updated_at = now();
  return false;
end;
$$;

create or replace function public.pj_admin_session_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'configured', exists(select 1 from private.pj_admin_secrets where id = 1),
    'admin_account', private.pj_is_admin_account(),
    'secure', private.pj_is_admin(),
    'verified_until', (
      select s.verified_until
      from private.pj_admin_sessions s
      where s.user_id = (select auth.uid())
        and s.session_id = private.pj_admin_session_id()
        and s.verified_until > now()
      limit 1
    ),
    'locked_until', (
      select a.locked_until
      from private.pj_admin_attempts a
      where a.user_id = (select auth.uid())
        and a.session_id = private.pj_admin_session_id()
        and a.locked_until > now()
      limit 1
    )
  );
$$;

create or replace function public.pj_admin_lock()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  sid text := nullif((select auth.jwt() ->> 'session_id'), '');
begin
  if uid is null or sid is null then return false; end if;
  delete from private.pj_admin_sessions where user_id = uid and session_id = sid;
  return true;
end;
$$;

revoke all on function public.pj_admin_stepup(text) from public, anon;
revoke all on function public.pj_admin_session_status() from public, anon;
revoke all on function public.pj_admin_lock() from public, anon;
grant execute on function public.pj_admin_stepup(text) to authenticated;
grant execute on function public.pj_admin_session_status() to authenticated;
grant execute on function public.pj_admin_lock() to authenticated;

-- Registered owner can confirm that this account is allowlisted before entering the Admin Key.
drop policy if exists "admin self check" on public.site_admins;
create policy "admin self check"
on public.site_admins
for select
to authenticated
using (user_id = (select auth.uid()));

select 'PJ ADMIN AUTH V3 READY // PHONE-FREE ADMIN KEY REQUIRED' as status;