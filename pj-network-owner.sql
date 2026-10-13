-- PJ // NETWORK owner activation
-- This registers the Lounge/Network UUID chosen by Pete as site owner/admin.
-- The UUID is an account identifier, not a password or secret.
-- Run this file once in Supabase SQL Editor as the project owner.

insert into public.site_admins(user_id)
values ('e9a85f39-5a27-4a75-9f4c-6f657a726c23'::uuid)
on conflict(user_id) do nothing;

select user_id, created_at
from public.site_admins
where user_id = 'e9a85f39-5a27-4a75-9f4c-6f657a726c23'::uuid;

select 'PJ OWNER ADMIN READY' as status;
