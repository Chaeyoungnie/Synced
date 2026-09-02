-- ============================================
-- FIX: Allow collaborators to access workspaces
-- and enable Realtime on files table
-- Safe to run multiple times
-- ============================================

-- Drop ALL existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owner and collaborators can view workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owner can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owner can delete workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view workspace files" ON files;
DROP POLICY IF EXISTS "Users can manage workspace files" ON files;
DROP POLICY IF EXISTS "Owner and collaborators can view files" ON files;
DROP POLICY IF EXISTS "Owner and editors can manage files" ON files;

DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can manage collaborators" ON collaborators;

DROP POLICY IF EXISTS "Users can view file versions" ON file_versions;
DROP POLICY IF EXISTS "Users can create file versions" ON file_versions;
DROP POLICY IF EXISTS "Owner and collaborators can manage file versions" ON file_versions;

DROP POLICY IF EXISTS "Owner and collaborators can manage messages" ON messages;

-- Workspaces: Owner + collaborators can view
CREATE POLICY "Owner and collaborators can view workspaces" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.workspace_id = workspaces.id
      AND collaborators.user_id = auth.uid()
    )
  );

-- Workspaces: Only owner can update/delete
CREATE POLICY "Owner can update workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete workspaces" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Files: Owner + collaborators can view
CREATE POLICY "Owner and collaborators can view files" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = files.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.workspace_id = workspaces.id
          AND collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- Files: Owner + editors/admins can insert/update/delete
CREATE POLICY "Owner and editors can manage files" ON files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = files.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.workspace_id = workspaces.id
          AND collaborators.user_id = auth.uid()
          AND collaborators.role IN ('editor', 'admin')
        )
      )
    )
  );

-- File versions: Owner + collaborators can view/manage
CREATE POLICY "Owner and collaborators can manage file versions" ON file_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM files
      JOIN workspaces ON workspaces.id = files.workspace_id
      WHERE files.id = file_versions.file_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.workspace_id = workspaces.id
          AND collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- Messages: Owner + collaborators can view/send
CREATE POLICY "Owner and collaborators can manage messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = messages.workspace_id
      AND (
        workspaces.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM collaborators
          WHERE collaborators.workspace_id = workspaces.id
          AND collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- ENABLE REALTIME on files table
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE files;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Populate email in profiles for existing users
-- ============================================
UPDATE profiles
SET email = (
  SELECT email FROM auth.users
  WHERE auth.users.id = profiles.id
)
WHERE email IS NULL OR email = '';
