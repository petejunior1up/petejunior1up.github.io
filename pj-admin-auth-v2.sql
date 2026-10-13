-- PJ // ADMIN AUTH v2
-- Permanent owner account security upgrade.
-- Run AFTER pj-network-v4.sql.
--
-- Admin actions now require BOTH:
--   1) the signed-in Supabase Auth user is listed in public.site_admins
--   2) the session has AAL2 (TOTP two-factor authentication verified)
--
-- This file does not contain an email, password, OTP, secret, or service-role key.

create schema if not exists private;

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

create or replace function private.pj_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.pj_is_admin_account()
    and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;

revoke all on function private.pj_is_admin_account() from public;
revoke all on function private.pj_is_admin() from public;
grant execute on function private.pj_is_admin_account() to authenticated;
grant execute on function private.pj_is_admin() to authenticated;

-- Keep self-check readable at AAL1 so a registered owner can reach the 2FA setup screen.
drop policy if exists "admin self check" on public.site_admins;
create policy "admin self check"
on public.site_admins
for select
to authenticated
using (user_id = (select auth.uid()));

select 'PJ ADMIN AUTH V2 READY // MFA REQUIRED FOR ADMIN ACTIONS' as status;