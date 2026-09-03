-- ============================================
-- INVITATIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending 
  ON invitations(workspace_id, invitee_email) 
  WHERE status = 'pending';

-- Fast lookup by invitee email
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email, status);

-- Fast lookup by workspace
CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON invitations(workspace_id, status);

-- Disable RLS (early stage)
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;

-- Enable Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE invitations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SELECT 'Invitations table ready' as status;
