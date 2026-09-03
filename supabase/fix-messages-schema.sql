-- Drop the wrong messages table and recreate with correct schema
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  file_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime
DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE messages; 
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- Verify
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages' ORDER BY ordinal_position;
