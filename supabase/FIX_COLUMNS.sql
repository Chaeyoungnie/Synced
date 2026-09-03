-- Add missing columns to existing tables (safe - uses IF NOT EXISTS)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS share_token TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE files ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'typescript';
ALTER TABLE files ADD COLUMN IF NOT EXISTS git_status TEXT DEFAULT 'committed';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create activity_log if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add auto-update trigger for workspaces.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS set_workspaces_updated_at ON workspaces;
  CREATE TRIGGER set_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN undefined_table THEN NULL; END $$;

SELECT 'SUCCESS: All columns added' as result;
