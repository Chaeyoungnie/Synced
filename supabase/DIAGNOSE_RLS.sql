-- DIAGNOSTIC: Check if the function works
-- Run this FIRST, then tell me the result

-- 1. Does the function exist?
SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_name = 'is_workspace_member';

-- 2. Can we call it directly?
SELECT public.is_workspace_member('00000000-0000-0000-0000-000000000000'::uuid, auth.uid());

-- 3. Does the function have correct permissions?
SELECT has_function_privilege('authenticated', 'public.is_workspace_member(uuid, uuid)', 'execute');

-- 4. What policies exist on workspaces RIGHT NOW?
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'workspaces' AND schemaname = 'public';

-- 5. Try a simple workspace query (should return your workspaces or empty)
SELECT count(*) FROM workspaces;