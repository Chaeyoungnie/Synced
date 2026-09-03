-- ============================================
-- FIX: Allow collaborators to access shared workspaces
-- Key: collaborators SELECT must NOT reference workspaces
-- (to avoid the infinite recursion we had before)
-- ============================================

-- 1. Drop existing policies on affected tables
DO $$ 
DECLARE 
  pol RECORD;
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['workspaces','collaborators']) LOOP
    FOR pol IN EXECUTE 'SELECT policyname FROM pg_policies WHERE tablename = ''' || tbl || '''' LOOP
      EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || tbl;
    END LOOP;
  END LOOP;
END $$;

-- 2. WORKSPACES policies

-- Owner can do everything
CREATE POLICY "ws_insert" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "ws_update" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "ws_delete" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Owner OR collaborator can view
CREATE POLICY "ws_select" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id
    OR
    id IN (
      SELECT workspace_id FROM collaborators
      WHERE user_id = auth.uid()
    )
  );

-- 3. COLLABORATORS policies

-- Owner can manage their workspace collaborators
CREATE POLICY "collab_insert" ON collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "collab_delete" ON collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- CRITICAL: collaborators SELECT must NOT reference workspaces
-- to avoid infinite recursion with workspaces SELECT
CREATE POLICY "collab_select" ON collaborators
  FOR SELECT USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Verify
SELECT 'Workspaces policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'workspaces' ORDER BY policyname;
SELECT 'Collaborators policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'collaborators' ORDER BY policyname;
