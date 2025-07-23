-- Updated Analytics Schema - Replacing Views with Reads
-- This script removes view tracking and focuses on read tracking for both announcements and documents

-- First, let's drop the existing views if they exist
DROP VIEW IF EXISTS announcement_analytics;
DROP VIEW IF EXISTS document_analytics;

-- Drop existing views column if it exists and rename/add read columns
-- For announcements table - remove views column if it exists
ALTER TABLE announcements DROP COLUMN IF EXISTS views;

-- For documents table - remove views column if it exists  
ALTER TABLE documents DROP COLUMN IF EXISTS views;

-- Create announcement_reads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.announcement_reads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT TRUE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, announcement_id)
);

-- Add columns if they don't exist
ALTER TABLE public.announcement_reads ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT TRUE;
ALTER TABLE public.announcement_reads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.announcement_reads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create document_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.document_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    viewed BOOLEAN DEFAULT FALSE,
    downloaded BOOLEAN DEFAULT FALSE,
    interaction_type TEXT CHECK (interaction_type IN ('view', 'download')),
    interacted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist
ALTER TABLE public.document_interactions ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.document_interactions ADD COLUMN IF NOT EXISTS downloaded BOOLEAN DEFAULT FALSE;
ALTER TABLE public.document_interactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.document_interactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Reset all analytics data to start fresh
-- Clear announcement reads
DELETE FROM announcement_reads;

-- Clear document interactions  
DELETE FROM document_interactions;

-- Create updated announcement analytics view
CREATE OR REPLACE VIEW announcement_analytics AS
SELECT 
  a.id,
  a.title,
  a.content,
  a.priority,
  a.created_at,
  a.updated_at,
  COUNT(DISTINCT ai.user_id) as unique_readers,
  COUNT(CASE WHEN ai.is_read = true THEN 1 END) as read_count,
  COUNT(CASE WHEN ai.is_read = false OR ai.is_read IS NULL THEN 1 END) as unread_count,
  CASE 
    WHEN COUNT(ai.id) > 0 
    THEN ROUND((COUNT(CASE WHEN ai.is_read = true THEN 1 END)::numeric / COUNT(ai.id)) * 100, 2)
    ELSE 0 
  END as read_percentage
FROM announcements a
LEFT JOIN announcement_reads ai ON a.id = ai.announcement_id
GROUP BY a.id, a.title, a.content, a.priority, a.created_at, a.updated_at;

-- Create updated document analytics view
CREATE OR REPLACE VIEW document_analytics AS
SELECT 
  d.id,
  d.name as title,
  d.description,
  d.file_path,
  d.file_size,
  d.file_type,
  d.created_at,
  d.updated_at,
  COUNT(DISTINCT di.user_id) as unique_readers,
  COUNT(CASE WHEN di.viewed = true THEN 1 END) as read_count,
  COUNT(CASE WHEN di.downloaded = true THEN 1 END) as download_count,
  COUNT(CASE WHEN di.viewed = false OR di.viewed IS NULL THEN 1 END) as unread_count,
  COUNT(CASE WHEN di.downloaded = false OR di.downloaded IS NULL THEN 1 END) as not_downloaded_count,
  CASE 
    WHEN COUNT(di.id) > 0 
    THEN ROUND((COUNT(CASE WHEN di.viewed = true THEN 1 END)::numeric / COUNT(di.id)) * 100, 2)
    ELSE 0 
  END as read_percentage,
  CASE 
    WHEN COUNT(di.id) > 0 
    THEN ROUND((COUNT(CASE WHEN di.downloaded = true THEN 1 END)::numeric / COUNT(di.id)) * 100, 2)
    ELSE 0 
  END as download_percentage
FROM documents d
LEFT JOIN document_interactions di ON d.id = di.document_id
GROUP BY d.id, d.name, d.description, d.file_path, d.file_size, d.file_type, d.created_at, d.updated_at;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_announcement_reads_updated_at ON public.announcement_reads;
CREATE TRIGGER update_announcement_reads_updated_at
    BEFORE UPDATE ON public.announcement_reads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_interactions_updated_at ON public.document_interactions;
CREATE TRIGGER update_document_interactions_updated_at
    BEFORE UPDATE ON public.document_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcement_reads_read ON announcement_reads(announcement_id, is_read);
CREATE INDEX IF NOT EXISTS idx_document_interactions_viewed ON document_interactions(document_id, viewed);
CREATE INDEX IF NOT EXISTS idx_document_interactions_downloaded ON document_interactions(document_id, downloaded);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id, announcement_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_user ON document_interactions(user_id, document_id);

-- Update RLS policies for announcement_reads
DROP POLICY IF EXISTS "Users can view their own announcement reads" ON announcement_reads;
DROP POLICY IF EXISTS "Admins can view all announcement reads" ON announcement_reads;

CREATE POLICY "Users can view their own announcement reads" ON announcement_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all announcement reads" ON announcement_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role_name IN ('Administrator', 'Senior VP', 'VP')
    )
  );

CREATE POLICY "Users can insert their own announcement reads" ON announcement_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcement reads" ON announcement_reads
  FOR UPDATE USING (auth.uid() = user_id);

-- Update RLS policies for document_interactions
DROP POLICY IF EXISTS "Users can view their own document interactions" ON document_interactions;
DROP POLICY IF EXISTS "Admins can view all document interactions" ON document_interactions;

CREATE POLICY "Users can view their own document interactions" ON document_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all document interactions" ON document_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role_name IN ('Administrator', 'Senior VP', 'VP')
    )
  );

CREATE POLICY "Users can insert their own document interactions" ON document_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document interactions" ON document_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on both tables
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_interactions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON announcement_analytics TO authenticated;
GRANT SELECT ON document_analytics TO authenticated;
GRANT ALL ON announcement_reads TO authenticated;
GRANT ALL ON document_interactions TO authenticated;

COMMIT;

-- Summary of changes:
-- 1. Removed 'views' columns from announcements and documents tables
-- 2. Reset all interaction data to start fresh
-- 3. Updated analytics views to focus on read tracking instead of view tracking
-- 4. For announcements: tracks is_read status
-- 5. For documents: tracks viewed (read) and downloaded status
-- 6. Updated RLS policies to use proper role checking
-- 7. Added performance indexes
-- 8. All analytics now show read counts instead of view counts