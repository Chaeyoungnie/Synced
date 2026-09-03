-- ============================================
-- DIAGNOSE ACTIVITY REALTIME
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if activities table has any data
SELECT COUNT(*) as total_activities FROM activities;

-- 2. Check recent activities
SELECT id, user_id, workspace_id, action, details, created_at 
FROM activities 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if Realtime is actually enabled (should show activities in the list)
SELECT pubname, tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 4. Insert a test activity to verify inserts work
-- Replace WORKSPACE_ID with your actual workspace ID (from the URL)
-- INSERT INTO activities (user_id, workspace_id, action, details) 
-- VALUES (auth.uid(), 'YOUR_WORKSPACE_ID_HERE', 'file_created', '{"fileName": "test.txt"}');
