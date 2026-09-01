-- ============================================
-- Collaborative Code Editor - Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. WORKSPACES
-- ============================================
CREATE TABLE public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- 3. FILES (file tree structure)
-- ============================================
CREATE TYPE public.file_type AS ENUM ('code', 'css', 'json', 'html', 'text', 'folder');
CREATE TYPE public.git_status AS ENUM ('committed', 'modified', 'new', 'untracked', 'deleted');

CREATE TABLE public.files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type public.file_type NOT NULL DEFAULT 'code',
  content TEXT DEFAULT '',
  git_status public.git_status DEFAULT 'committed' NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, path)
);

-- ============================================
-- 4. WORKSPACE COLLABORATORS
-- ============================================
CREATE TYPE public.collaborator_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

CREATE TABLE public.collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.collaborator_role DEFAULT 'viewer' NOT NULL,
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- ============================================
-- 5. FILE VERSIONS (history)
-- ============================================
CREATE TABLE public.file_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- 6. ACTIVITY LOG
-- ============================================
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- 7. CHAT MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  file_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_files_workspace ON public.files(workspace_id);
CREATE INDEX idx_files_parent ON public.files(parent_id);
CREATE INDEX idx_files_path ON public.files(workspace_id, path);
CREATE INDEX idx_collaborators_workspace ON public.collaborators(workspace_id);
CREATE INDEX idx_collaborators_user ON public.collaborators(user_id);
CREATE INDEX idx_activities_workspace ON public.activities(workspace_id);
CREATE INDEX idx_messages_workspace ON public.messages(workspace_id);
CREATE INDEX idx_file_versions_file ON public.file_versions(file_id);
CREATE INDEX idx_workspaces_owner ON public.workspaces(owner_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workspaces: owners and collaborators can read, owners can update/delete
CREATE POLICY "Public workspaces are viewable by everyone" ON public.workspaces FOR SELECT USING (is_public = true);
CREATE POLICY "Collaborators can view workspace" ON public.workspaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collaborators WHERE workspace_id = id AND user_id = auth.uid())
  OR owner_id = auth.uid()
);
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update workspaces" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete workspaces" ON public.workspaces FOR DELETE USING (owner_id = auth.uid());

-- Files: workspace collaborators can read/write
CREATE POLICY "Collaborators can view files" ON public.files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    LEFT JOIN public.collaborators c ON c.workspace_id = w.id
    WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR c.user_id = auth.uid() OR w.is_public = true)
  )
);
CREATE POLICY "Editors can insert files" ON public.files FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = workspace_id AND c.user_id = auth.uid() AND c.role IN ('owner', 'admin', 'editor')
  )
);
CREATE POLICY "Editors can update files" ON public.files FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = workspace_id AND c.user_id = auth.uid() AND c.role IN ('owner', 'admin', 'editor')
  )
);
CREATE POLICY "Admins can delete files" ON public.files FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = workspace_id AND c.user_id = auth.uid() AND c.role IN ('owner', 'admin')
  )
);

-- Collaborators: workspace owners can manage
CREATE POLICY "Collaborators viewable by workspace members" ON public.collaborators FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = collaborators.workspace_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Owners can manage collaborators" ON public.collaborators FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
  )
);

-- Messages: workspace members can read/write
CREATE POLICY "Members can view messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = messages.workspace_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Members can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = messages.workspace_id AND c.user_id = auth.uid()
  )
);

-- Activities: workspace members can read
CREATE POLICY "Members can view activities" ON public.activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.workspace_id = activities.workspace_id AND c.user_id = auth.uid()
  )
);

-- File versions: workspace members can read
CREATE POLICY "Members can view versions" ON public.file_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.files f
    JOIN public.collaborators c ON c.workspace_id = f.workspace_id
    WHERE f.id = file_id AND c.user_id = auth.uid()
  )
);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-add owner as collaborator when workspace is created
CREATE OR REPLACE FUNCTION public.add_owner_as_collaborator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.collaborators (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_collaborator();
