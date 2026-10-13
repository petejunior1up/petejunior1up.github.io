-- PJ // ADMIN — set or rotate the private Admin Key
-- Run this ONLY in Supabase SQL Editor after pj-admin-auth-v2.sql.
--
-- IMPORTANT:
-- 1) Replace CHANGE_THIS_TO_YOUR_PRIVATE_ADMIN_KEY below inside Supabase.
-- 2) Use a long unique key/passphrase (at least 16 characters recommended).
-- 3) Do NOT send the key to ChatGPT, put it in GitHub, or share it with anyone.
-- 4) Supabase stores only a one-way bcrypt hash in private.pj_admin_secrets.

DO $$
DECLARE
  raw_key text := 'CHANGE_THIS_TO_YOUR_PRIVATE_ADMIN_KEY';
BEGIN
  IF raw_key = 'CHANGE_THIS_TO_YOUR_PRIVATE_ADMIN_KEY' OR char_length(raw_key) < 16 THEN
    RAISE EXCEPTION 'Replace the placeholder with a private Admin Key of at least 16 characters.';
  END IF;

  INSERT INTO private.pj_admin_secrets(id, secret_hash, updated_at)
  VALUES (1, extensions.crypt(raw_key, extensions.gen_salt('bf', 12)), now())
  ON CONFLICT (id) DO UPDATE
    SET secret_hash = excluded.secret_hash,
        updated_at = now();

  -- Rotating the key immediately locks every previously step-verified Admin session.
  DELETE FROM private.pj_admin_sessions;
  DELETE FROM private.pj_admin_attempts;
END $$;

select 'PJ PRIVATE ADMIN KEY READY' as status;