-- ============================================================
-- Nagrik Bodh — Admin Bootstrap Script
-- ============================================================
-- Use this script to promote an existing registered user to 'admin'
-- or inspect current administrative roles.
--
-- How to use:
-- 1. Sign up on the platform with your email (e.g. admin@nagrikbodh.in)
-- 2. Run this script in the Supabase SQL Editor replacing the email below:
-- ============================================================

DO $$
DECLARE
  target_email TEXT := 'vishalramesh.official@gmail.com'; -- <-- REPLACE WITH YOUR EMAIL
  target_user_id UUID;
BEGIN
  -- Find the user ID from auth.users or profiles
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % was not found in auth.users. Please register the account first.', target_email;
  ELSE
    -- Ensure profile exists and promote to admin
    INSERT INTO public.profiles (id, email, display_name, role, language_pref)
    VALUES (target_user_id, target_email, 'System Administrator', 'admin', 'en')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', updated_at = NOW();

    RAISE NOTICE 'Successfully promoted % (ID: %) to platform admin.', target_email, target_user_id;
  END IF;
END $$;

-- Verify admin users
SELECT id, email, display_name, role, created_at
FROM public.profiles
WHERE role IN ('admin', 'editor', 'reviewer');
