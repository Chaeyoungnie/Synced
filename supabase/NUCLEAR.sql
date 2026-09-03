-- ============================================
-- NUCLEAR OPTION: Disable all RLS, verify tables work,
-- then add back the simplest possible policies
-- ============================================

-- STEP 1: Disable RLS on everything
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- STEP 2: Verify the workspaces table has the right columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workspaces' 
ORDER BY ordinal_position;

-- STEP 3: Test a simple query (should return rows, not error)
SELECT count(*) as workspace_count FROM workspaces;
