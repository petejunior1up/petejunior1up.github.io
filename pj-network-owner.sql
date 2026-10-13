-- PJ // NETWORK owner activation
-- Replace YOUR_USER_UUID with the UUID shown by PJ Network → PJ ID → COPY MY USER ID.
-- This UUID is not a password, but only register the account/session you want to be site owner.
-- Run this in Supabase SQL Editor as the project owner.

-- Example:
-- insert into public.site_admins(user_id)
-- values ('YOUR_USER_UUID'::uuid)
-- on conflict(user_id) do nothing;

-- To verify after replacing the UUID:
-- select user_id, created_at from public.site_admins;

select 'REPLACE YOUR_USER_UUID, THEN UNCOMMENT THE INSERT' as status;