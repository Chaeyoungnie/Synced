-- Enable Realtime on messages table
DO $$ BEGIN 
  ALTER PUBLICATION supabase_realtime ADD TABLE messages; 
EXCEPTION WHEN duplicate_object THEN NULL; 
END $$;

-- Verify
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
