-- Fix messages RLS: allow owner AND collaborators to read/send

-- Drop old policy
DO $$ 
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'messages' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON messages';
  END LOOP;
END $$;

-- Owner can do everything
CREATE POLICY "msg_owner" ON messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = messages.workspace_id AND workspaces.owner_id = auth.uid())
  );

-- Collaborators can read and send messages
CREATE POLICY "msg_collab" ON messages
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM collaborators WHERE user_id = auth.uid())
  );
