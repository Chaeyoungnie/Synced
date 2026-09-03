-- Fix: Allow authenticated users to read basic profile info
-- (needed for collaborator name display)

-- Drop existing profiles policies
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
  END LOOP;
END $$;

-- Owner can do everything with their own profile
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Any authenticated user can read basic profile info (name, avatar)
-- This is needed so collaborators can see each other's names
CREATE POLICY "profiles_read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
