-- ============================================
-- FIX INFINITE RECURSION in RLS policies
-- The problem: workspaces policy reads collaborators,
-- collaborators policy reads workspaces = infinite loop
-- ============================================

-- 1. Drop ALL policies on affected tables
DO $$ 
DECLARE 
  pol RECORD;
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['workspaces','collaborators','files','file_versions','messages']) LOOP
    FOR pol IN EXECUTE 'SELECT policyname FROM pg_policies WHERE tablename = ''' || tbl || '''' LOOP
      EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || tbl;
    END LOOP;
  END LOOP;
END $$;

-- 2. Disable RLS temporarily to clean slate
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Create NON-RECURSIVE policies
-- Key rule: NO policy should reference a table that references back to it

-- WORKSPACES: simple owner-only policy (no collaborators check)
CREATE POLICY "ws_select" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id
  );

CREATE POLICY "ws_insert" ON workspaces
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

CREATE POLICY "ws_update" ON workspaces
  FOR UPDATE USING (
    auth.uid() = owner_id
  );

CREATE POLICY "ws_delete" ON workspaces
  FOR DELETE USING (
    auth.uid() = owner_id
  );

-- FILES: check workspace ownership directly (no collaborators join)
CREATE POLICY "files_all" ON files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = files.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- COLLABORATORS: owner can manage their workspace collaborators
CREATE POLICY "collab_insert" ON collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "collab_select" ON collaborators
  FOR SELECT USING (
    -- Can see collaborators for workspaces you own
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.owner_id = auth.uid()
    )
    OR
    -- Or if you are a collaborator yourself (reads own row only)
    user_id = auth.uid()
  );

CREATE POLICY "collab_delete" ON collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- FILE VERSIONS
CREATE POLICY "fv_all" ON file_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM files
      JOIN workspaces ON workspaces.id = files.workspace_id
      WHERE files.id = file_versions.file_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- MESSAGES
CREATE POLICY "msg_all" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = messages.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- 5. Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'workspaces' ORDER BY policyname;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'collaborators' ORDER BY policyname;
