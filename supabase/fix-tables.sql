-- Fix missing columns in existing tables

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add missing columns to files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS git_status TEXT DEFAULT 'untracked';

-- Add missing columns to workspaces table
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Drop and recreate RLS policies to be more permissive

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view workspace files" ON files;
DROP POLICY IF EXISTS "Users can manage workspace files" ON files;

DROP POLICY IF EXISTS "Users can view collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can manage collaborators" ON collaborators;

DROP POLICY IF EXISTS "Users can view file versions" ON file_versions;
DROP POLICY IF EXISTS "Users can create file versions" ON file_versions;

-- Recreate more permissive policies

-- Profiles: users can do everything with their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR ALL USING (auth.uid() = id);

-- Workspaces: users can do everything with their own workspaces
CREATE POLICY "Users can view own workspaces" ON workspaces 
  FOR ALL USING (auth.uid() = owner_id);

-- Files: users can do everything with files in their workspaces
CREATE POLICY "Users can manage workspace files" ON files 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = files.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Collaborators: users can manage collaborators in their workspaces
CREATE POLICY "Users can manage collaborators" ON collaborators 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = collaborators.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- File versions: users can manage versions for files in their workspaces
CREATE POLICY "Users can manage file versions" ON file_versions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM files 
      JOIN workspaces ON workspaces.id = files.workspace_id 
      WHERE files.id = file_versions.file_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Make sure the trigger exists for creating profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
