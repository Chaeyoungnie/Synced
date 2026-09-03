-- ============================================
-- ACTIVITIES TABLE + REALTIME
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create activities table (safe — won't error if exists)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add indexes
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- 3. Disable RLS on activities (no sensitive data, workspace-scoped)
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- 4. Enable Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE activities;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Verify
SELECT 'activities table ready' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'activities';
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'activities';
