-- Create activities table if it doesn't exist (or rename activity_log)
DO $$ BEGIN
  ALTER TABLE activity_log RENAME TO activities;
EXCEPTION WHEN undefined_table THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- Create if neither exists
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- Enable realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE activities;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SELECT 'Activities table ready' as result;
