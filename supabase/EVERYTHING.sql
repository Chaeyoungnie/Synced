-- ============================================
-- DEFINITIVE SETUP — Run this ONCE in Supabase SQL Editor
-- Creates all tables, policies, triggers
-- Safe to run multiple times
-- ============================================

-- =====================
-- TABLES
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS share_token TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID,
  name TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'code',
  content TEXT DEFAULT '',
  language TEXT DEFAULT 'plaintext',
  git_status TEXT DEFAULT 'untracked',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE files ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE files ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'plaintext';
ALTER TABLE files ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS git_status TEXT DEFAULT 'untracked';

CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  version_number INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  file_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- TRIGGERS
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- RLS: DROP ALL OLD POLICIES
-- =====================
DO $$
DECLARE pol RECORD; tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['profiles','workspaces','files','collaborators','file_versions','activities','messages']) LOOP
    FOR pol IN EXECUTE 'SELECT policyname FROM pg_policies WHERE tablename = ''' || tbl || '''' LOOP
      EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || tbl;
    END LOOP;
  END LOOP;
END $$;

-- =====================
-- RLS: ENABLE
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS: PROFILES
-- =====================
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_read" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- RLS: WORKSPACES
-- =====================
CREATE POLICY "ws_insert" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "ws_select" ON workspaces
  FOR SELECT USING (
    auth.uid() = owner_id
    OR id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "ws_update" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "ws_delete" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- =====================
-- RLS: COLLABORATORS
-- =====================
CREATE POLICY "collab_insert" ON collaborators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_id AND workspaces.owner_id = auth.uid())
  );

CREATE POLICY "collab_select" ON collaborators
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY "collab_delete" ON collaborators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_id AND workspaces.owner_id = auth.uid())
  );

-- =====================
-- RLS: FILES
-- =====================
CREATE POLICY "files_owner" ON files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = files.workspace_id AND workspaces.owner_id = auth.uid())
  );

CREATE POLICY "files_collab" ON files
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
  );

-- =====================
-- RLS: FILE VERSIONS
-- =====================
CREATE POLICY "fv_all" ON file_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM files JOIN workspaces ON workspaces.id = files.workspace_id WHERE files.id = file_versions.file_id AND workspaces.owner_id = auth.uid())
  );

-- =====================
-- RLS: ACTIVITIES
-- =====================
CREATE POLICY "act_insert" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "act_select" ON activities
  FOR SELECT USING (auth.uid() = user_id);

-- =====================
-- RLS: MESSAGES
-- =====================
CREATE POLICY "msg_owner" ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = messages.workspace_id AND workspaces.owner_id = auth.uid())
  );

CREATE POLICY "msg_collab" ON messages
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
  );

-- =====================
-- REALTIME
-- =====================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE files; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE collaborators; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE messages; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================
-- POPULATE EMAILS
-- =====================
UPDATE profiles SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id) WHERE email IS NULL OR email = '';

-- =====================
-- VERIFY
-- =====================
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
