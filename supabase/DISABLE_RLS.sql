-- Disable RLS on ALL tables
-- This lets everyone read/write everything
-- Fine for testing, secure later

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled on all tables' as status;
