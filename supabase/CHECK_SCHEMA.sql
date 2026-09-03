-- Check what columns each table actually has
SELECT 'profiles' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'messages', column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'messages' AND table_schema = 'public'
UNION ALL
SELECT 'workspaces', column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'workspaces' AND table_schema = 'public'
UNION ALL
SELECT 'collaborators', column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'collaborators' AND table_schema = 'public'
UNION ALL
SELECT 'files', column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'files' AND table_schema = 'public'
UNION ALL
SELECT 'file_versions', column_name, data_type, is_nullable
FROM information_schema.columns WHERE table_name = 'file_versions' AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
