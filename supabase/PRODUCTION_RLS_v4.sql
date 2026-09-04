-- RLS v4 - CLEAN AND SIMPLE

-- STEP 1: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- STEP 2: Drop old policies (use DO to ignore if not exists)
DO $$ BEGIN DROP POLICY IF EXISTS "profiles_own" ON profiles; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "profiles_read" ON profiles; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_owner" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_create" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_collab_read" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can update workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can delete workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_all" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_member" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_insert" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_update" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_delete" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and editors can manage files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_member" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_all" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_owner" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage file versions" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_all" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_member" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_insert" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_owner" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage messages" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "act_insert" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "act_read" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "act_select" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "activity_insert" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "activity_read" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_insert" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_read" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_update" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- STEP 3: PROFILES
CREATE POLICY p_own ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY p_read ON profiles FOR SELECT USING (true);

-- STEP 4: WORKSPACES
CREATE POLICY w_owner ON workspaces FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY w_collab ON workspaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = id AND user_id = auth.uid())
);

-- STEP 5: FILES
CREATE POLICY f_all ON files FOR ALL USING (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = files.workspace_id AND user_id = auth.uid())
);

-- STEP 6: FILE VERSIONS
CREATE POLICY fv_all ON file_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM files f JOIN workspaces w ON w.id = f.workspace_id WHERE f.id = file_versions.file_id AND (w.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = w.id AND user_id = auth.uid())))
);

-- STEP 7: MESSAGES
CREATE POLICY m_all ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = messages.workspace_id AND user_id = auth.uid())
);

-- STEP 8: ACTIVITIES
CREATE POLICY a_read ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = activities.workspace_id AND user_id = auth.uid())
);
CREATE POLICY a_insert ON activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM collaborators WHERE workspace_id = activities.workspace_id AND user_id = auth.uid())
);

-- STEP 9: INVITATIONS
CREATE POLICY i_insert ON invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);
CREATE POLICY i_read ON invitations FOR SELECT USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);
CREATE POLICY i_update ON invitations FOR UPDATE USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id AND owner_id = auth.uid())
);

-- STEP 10: Enable Realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE files; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE collaborators; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE activities; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE invitations; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE profiles SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id) WHERE email IS NULL OR email = '';

SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;