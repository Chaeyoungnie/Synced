-- ============================================
-- DIAGNOSTIC: Find why workspaces returns 500
-- Run this in Supabase SQL Editor and check the output
-- ============================================

-- 1. Check if the workspaces table exists and has the right columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workspaces' 
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('workspaces', 'files', 'collaborators', 'profiles');

-- 3. Check what policies exist on workspaces
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'workspaces';

-- 4. Check what policies exist on collaborators
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'collaborators';

-- 5. Quick test - can we read workspaces without RLS?
-- (This tells us if RLS is the problem)
SET LOCAL role = 'anon';
SELECT count(*) FROM workspaces;
RESET role;

-- ============================================
-- FIX: If RLS is blocking everything, 
-- temporarily disable it to verify, then re-enable with correct policies
-- ============================================

-- Disable RLS on workspaces temporarily
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

-- Enable it back
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Drop ALL policies and recreate clean ones
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'workspaces'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON workspaces';
  END LOOP;
END $$;

-- Same for collaborators
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'collaborators'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON collaborators';
  END LOOP;
END $$;

-- NOW CREATE CLEAN POLICIES (no recursion risk)

-- Workspaces: owner can do everything
CREATE POLICY "ws_owner_all" ON workspaces
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Workspaces: collaborators can view
CREATE POLICY "ws_collab_select" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.workspace_id = workspaces.id
      AND collaborators.user_id = auth.uid()
    )
  );

-- Collaborators: workspace owner can manage
CREATE POLICY "collab_owner_all" ON collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = collaborators.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Collaborators: collaborators can view their own workspace's members
CREATE POLICY "collab_member_select" ON collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborators c2
      WHERE c2.workspace_id = collaborators.workspace_id
      AND c2.user_id = auth.uid()
    )
  );

-- Files: owner + collaborators
CREATE POLICY "files_access" ON files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = files.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- File versions
CREATE POLICY "fv_access" ON file_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM files
      JOIN workspaces ON workspaces.id = files.workspace_id
      WHERE files.id = file_versions.file_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Messages
CREATE POLICY "msg_access" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = messages.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Verify
SELECT 'Policies created' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'workspaces';
