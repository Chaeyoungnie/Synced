-- Disable RLS on ALL tables. That's it.
-- You can add it back later with proper policies.
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled on all tables' as result;
