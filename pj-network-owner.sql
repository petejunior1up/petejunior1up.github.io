-- PJ // NETWORK owner activation
-- Permanent Supabase Auth UUID selected by Pete for Lounge/Network ownership.
-- The UUID is an account identifier, not a password or secret.
-- Run this only if the permanent account needs to be re-added to site_admins.

insert into public.site_admins(user_id)
values ('9917df2e-2c74-4157-9b27-f3f09d660757'::uuid)
on conflict(user_id) do nothing;

select user_id, created_at
from public.site_admins
where user_id = '9917df2e-2c74-4157-9b27-f3f09d660757'::uuid;

select 'PJ PERMANENT OWNER READY' as status;
