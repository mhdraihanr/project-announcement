-- Create analytics tracking tables for better data tracking

-- Add active column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Table to track user interactions with announcements
CREATE TABLE IF NOT EXISTS public.announcement_reads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, announcement_id)
);

-- Table to track user interactions with documents
CREATE TABLE IF NOT EXISTS public.document_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'download')),
    interacted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user_id ON public.announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON public.announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_user_id ON public.document_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_document_id ON public.document_interactions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_type ON public.document_interactions(interaction_type);

-- Enable RLS
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcement_reads
DROP POLICY IF EXISTS "Users can view their own announcement reads" ON public.announcement_reads;
CREATE POLICY "Users can view their own announcement reads" ON public.announcement_reads
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own announcement reads" ON public.announcement_reads;
CREATE POLICY "Users can insert their own announcement reads" ON public.announcement_reads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Analytics can view all announcement reads" ON public.announcement_reads;
CREATE POLICY "Analytics can view all announcement reads" ON public.announcement_reads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.name IN ('Administrator', 'Senior VP', 'VP')
        )
    );

-- RLS Policies for document_interactions
DROP POLICY IF EXISTS "Users can view their own document interactions" ON public.document_interactions;
CREATE POLICY "Users can view their own document interactions" ON public.document_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own document interactions" ON public.document_interactions;
CREATE POLICY "Users can insert their own document interactions" ON public.document_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Analytics can view all document interactions" ON public.document_interactions;
CREATE POLICY "Analytics can view all document interactions" ON public.document_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.name IN ('Administrator', 'Senior VP', 'VP')
        )
    );

-- Function to mark announcement as read
CREATE OR REPLACE FUNCTION mark_announcement_read(announcement_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.announcement_reads (user_id, announcement_id)
    VALUES (auth.uid(), announcement_id)
    ON CONFLICT (user_id, announcement_id) DO NOTHING;
    
    -- Also increment views counter
    UPDATE public.announcements
    SET views = views + 1,
        updated_at = NOW()
    WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track document interaction
CREATE OR REPLACE FUNCTION track_document_interaction(document_id UUID, interaction_type TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.document_interactions (user_id, document_id, interaction_type)
    VALUES (auth.uid(), document_id, interaction_type);
    
    -- Update counters in documents table
    IF interaction_type = 'view' THEN
        UPDATE public.documents
        SET views = views + 1,
            updated_at = NOW()
        WHERE id = document_id;
    ELSIF interaction_type = 'download' THEN
        UPDATE public.documents
        SET downloads = downloads + 1,
            updated_at = NOW()
        WHERE id = document_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics views for better performance
CREATE OR REPLACE VIEW public.announcement_analytics AS
SELECT 
    a.id,
    a.title,
    a.created_at,
    a.views,
    COUNT(ar.user_id) as read_count,
    (SELECT COUNT(*) FROM public.users WHERE active = true) - COUNT(ar.user_id) as unread_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.users WHERE active = true) > 0 
        THEN ROUND((COUNT(ar.user_id)::numeric / (SELECT COUNT(*) FROM public.users WHERE active = true)::numeric) * 100, 2)
        ELSE 0
    END as read_percentage
FROM public.announcements a
LEFT JOIN public.announcement_reads ar ON a.id = ar.announcement_id
GROUP BY a.id, a.title, a.created_at, a.views
ORDER BY a.created_at DESC;

CREATE OR REPLACE VIEW public.document_analytics AS
SELECT 
    d.id,
    d.name as title,
    d.created_at,
    d.views,
    d.downloads,
    COUNT(CASE WHEN di.interaction_type = 'view' THEN 1 END) as view_interactions,
    COUNT(CASE WHEN di.interaction_type = 'download' THEN 1 END) as download_interactions,
    COUNT(DISTINCT CASE WHEN di.interaction_type = 'view' THEN di.user_id END) as unique_viewers,
    COUNT(DISTINCT CASE WHEN di.interaction_type = 'download' THEN di.user_id END) as unique_downloaders,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.users WHERE active = true) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN di.interaction_type = 'view' THEN di.user_id END)::numeric / (SELECT COUNT(*) FROM public.users WHERE active = true)::numeric) * 100, 2)
        ELSE 0
    END as view_percentage,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.users WHERE active = true) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN di.interaction_type = 'download' THEN di.user_id END)::numeric / (SELECT COUNT(*) FROM public.users WHERE active = true)::numeric) * 100, 2)
        ELSE 0
    END as download_percentage
FROM public.documents d
LEFT JOIN public.document_interactions di ON d.id = di.document_id
GROUP BY d.id, d.name, d.created_at, d.views, d.downloads
ORDER BY d.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.announcement_reads TO authenticated;
GRANT INSERT ON public.announcement_reads TO authenticated;
GRANT SELECT ON public.document_interactions TO authenticated;
GRANT INSERT ON public.document_interactions TO authenticated;
GRANT SELECT ON public.announcement_analytics TO authenticated;
GRANT SELECT ON public.document_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION mark_announcement_read TO authenticated;
GRANT EXECUTE ON FUNCTION track_document_interaction TO authenticated;

-- Insert some sample data for testing (optional)
-- This will create some read records for existing announcements
INSERT INTO public.announcement_reads (user_id, announcement_id, read_at)
SELECT 
    u.id as user_id,
    a.id as announcement_id,
    a.created_at + INTERVAL '1 hour' as read_at
FROM public.users u
CROSS JOIN public.announcements a
WHERE random() > 0.3  -- Randomly assign 70% read rate
ON CONFLICT (user_id, announcement_id) DO NOTHING;

-- Insert some sample document interactions
INSERT INTO public.document_interactions (user_id, document_id, interaction_type, interacted_at)
SELECT 
    u.id as user_id,
    d.id as document_id,
    'view' as interaction_type,
    d.created_at + INTERVAL '2 hours' as interacted_at
FROM public.users u
CROSS JOIN public.documents d
WHERE random() > 0.4  -- 60% view rate
ON CONFLICT DO NOTHING;

INSERT INTO public.document_interactions (user_id, document_id, interaction_type, interacted_at)
SELECT 
    u.id as user_id,
    d.id as document_id,
     'download' as interaction_type,
    d.created_at + INTERVAL '3 hours' as interacted_at
FROM public.users u
CROSS JOIN public.documents d
WHERE random() > 0.7  -- 30% download rate
ON CONFLICT DO NOTHING;