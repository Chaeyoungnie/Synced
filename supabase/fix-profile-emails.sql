-- ============================================
-- FIX: Populate email in profiles for existing users
-- ============================================

-- Update all profiles to have email from auth.users
UPDATE profiles
SET email = (
  SELECT email FROM auth.users
  WHERE auth.users.id = profiles.id
)
WHERE email IS NULL OR email = '';

-- Verify the update
SELECT id, full_name, email FROM profiles;
