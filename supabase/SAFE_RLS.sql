-- ============================================
-- SAFE RLS - Simple owner-only policies
-- No recursion, no security warnings
-- ============================================

-- Enable RLS on all tables that exist
DO $$ BEGIN ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE files ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE messages ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Drop ALL existing policies safely
DO $$ BEGIN DROP POLICY IF EXISTS "profiles_own" ON profiles; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_owner" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_owner" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_owner" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_self" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_owner" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_owner" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_all" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_all" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can update workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can delete workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and editors can manage files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage file versions" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage messages" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage collaborators" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage workspace files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage collaborators" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage file versions" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- PROFILES: Users can read/update their own
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- WORKSPACES: Owner has full access
CREATE POLICY "ws_owner" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

-- FILES: Owner has full access
CREATE POLICY "files_owner" ON files
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- COLLABORATORS: Owner can manage, users can see their own
CREATE POLICY "collab_owner" ON collaborators
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "collab_self" ON collaborators
  FOR SELECT USING (user_id = auth.uid());

-- FILE VERSIONS: Owner has full access
CREATE POLICY "fv_owner" ON file_versions
  FOR ALL USING (
    file_id IN (
      SELECT f.id FROM files f
      JOIN workspaces w ON w.id = f.workspace_id
      WHERE w.owner_id = auth.uid()
    )
  );

-- MESSAGES: Owner has full access
CREATE POLICY "msg_owner" ON messages
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- ENABLE REALTIME
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE files; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE collaborators; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- POPULATE MISSING EMAILS
UPDATE profiles
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL OR email = '';

-- Verify
SELECT 'SUCCESS: All policies created' as result;
