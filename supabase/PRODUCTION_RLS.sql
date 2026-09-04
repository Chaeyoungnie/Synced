-- ============================================
-- PRODUCTION RLS POLICIES
-- Uses SECURITY DEFINER to avoid infinite recursion
-- Safe to run multiple times (drops + recreates)
-- ============================================

-- STEP 1: Helper function (bypasses RLS on collaborators)
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaborators WHERE workspace_id = ws_id AND user_id = uid
  ) OR EXISTS (
    SELECT 1 FROM workspaces WHERE id = ws_id AND owner_id = uid
  );
$$;

-- Grant execute to authenticated role
DO $$ BEGIN
  GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID, UUID) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID, UUID) TO anon;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- STEP 2: Drop all existing policies safely
DO $$ BEGIN DROP POLICY IF EXISTS "profiles_own" ON profiles; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "profiles_read" ON profiles; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_owner" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_create" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_collab_read" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_insert" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "ws_collab_read_v2" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can update workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can delete workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_member" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_insert" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_update" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_delete" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_owner" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "files_all" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can view files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and editors can manage files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage workspace files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can view workspace files" ON files; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_owner" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_self" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_read" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "collab_insert" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can insert collaborators" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner can manage collaborators" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage collaborators" ON collaborators; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_member" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_owner" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "fv_all" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage file versions" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can manage file versions" ON file_versions; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_member" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_insert" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_owner" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "msg_all" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Owner and collaborators can manage messages" ON messages; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "act_insert" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "act_read" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "activity_insert" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "activity_read" ON activities; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_insert" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_read" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "inv_update" ON invitations; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- STEP 3: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- STEP 4: PROFILES
CREATE POLICY profiles_own ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY profiles_read ON profiles FOR SELECT USING (true);

-- STEP 5: WORKSPACES
CREATE POLICY ws_create ON workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY ws_owner ON workspaces FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY ws_collab_read ON workspaces FOR SELECT USING (public.is_workspace_member(id, auth.uid()));

-- STEP 6: FILES
CREATE POLICY files_member ON files FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY files_update ON files FOR UPDATE USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY files_delete ON files FOR DELETE USING (public.is_workspace_member(workspace_id, auth.uid()));

-- STEP 7: COLLABORATORS
CREATE POLICY collab_owner ON collaborators FOR ALL USING (
  EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = collaborators.workspace_id AND workspaces.owner_id = auth.uid())
);
CREATE POLICY collab_self ON collaborators FOR SELECT USING (user_id = auth.uid());
CREATE POLICY collab_read ON collaborators FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));

-- STEP 8: FILE VERSIONS
CREATE POLICY fv_member ON file_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM files f WHERE f.id = file_versions.file_id AND public.is_workspace_member(f.workspace_id, auth.uid()))
);

-- STEP 9: MESSAGES
CREATE POLICY msg_member ON messages FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY msg_insert ON messages FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()) AND auth.uid() = user_id);

-- STEP 10: ACTIVITIES
CREATE POLICY act_read ON activities FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY act_insert ON activities FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- STEP 11: INVITATIONS
CREATE POLICY inv_insert ON invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = invitations.workspace_id AND workspaces.owner_id = auth.uid())
);
CREATE POLICY inv_read ON invitations FOR SELECT USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = invitations.workspace_id AND workspaces.owner_id = auth.uid())
);
CREATE POLICY inv_update ON invitations FOR UPDATE USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = invitations.workspace_id AND workspaces.owner_id = auth.uid())
);

-- STEP 12: Enable Realtime
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE files; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE collaborators; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE activities; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE invitations; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STEP 13: Populate missing emails
UPDATE profiles SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id) WHERE email IS NULL OR email = '';

-- VERIFY
SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;