-- PJ // ADMIN — switch from anonymous owner to permanent Auth account
-- IMPORTANT: Replace PASTE_NEW_ADMIN_UUID_HERE before running.
-- Never put your password, OTP, authenticator secret, service-role key, or database password here.
--
-- This transaction adds the new account FIRST, then removes every other admin row.
-- If the UUID is invalid, the transaction fails before changing the admin list.

begin;

insert into public.site_admins(user_id)
values ('PASTE_NEW_ADMIN_UUID_HERE'::uuid)
on conflict(user_id) do nothing;

delete from public.site_admins
where user_id <> 'PASTE_NEW_ADMIN_UUID_HERE'::uuid;

commit;

select user_id, created_at from public.site_admins;
select 'PERMANENT PJ OWNER REGISTERED' as status;