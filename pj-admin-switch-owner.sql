-- PJ // ADMIN — switch from anonymous owner to permanent Auth account
-- Permanent admin UUID selected by Pete.
-- Never put your password, OTP, authenticator secret, service-role key, or database password here.
--
-- This transaction adds the permanent account FIRST, then removes every other admin row.
-- If the UUID is invalid, the transaction fails before changing the admin list.

begin;

insert into public.site_admins(user_id)
values ('9917df2e-2c74-4157-9b27-f3f09d660757'::uuid)
on conflict(user_id) do nothing;

delete from public.site_admins
where user_id <> '9917df2e-2c74-4157-9b27-f3f09d660757'::uuid;

commit;

select user_id, created_at from public.site_admins;
select 'PERMANENT PJ OWNER REGISTERED' as status;
