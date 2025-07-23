-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    department TEXT,
    departments JSONB, -- For storing multiple departments as JSON array
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    pinned BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb, -- For storing tags as JSON array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for announcements table
DROP POLICY IF EXISTS "announcements_select_policy" ON public.announcements;
CREATE POLICY "announcements_select_policy" 
    ON public.announcements FOR SELECT 
    USING (true); -- Everyone can view announcements

DROP POLICY IF EXISTS "announcements_insert_policy" ON public.announcements;
CREATE POLICY "announcements_insert_policy" 
    ON public.announcements FOR INSERT 
    WITH CHECK (
        -- Only authenticated users who are not Employee or Officer can create
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.name NOT IN ('Employee', 'Officer')
        )
    );

DROP POLICY IF EXISTS "announcements_update_policy" ON public.announcements;
CREATE POLICY "announcements_update_policy" 
    ON public.announcements FOR UPDATE 
    USING (
        -- Only authenticated users who are not Employee or Officer can update
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.name NOT IN ('Employee', 'Officer')
        )
    );

DROP POLICY IF EXISTS "announcements_delete_policy" ON public.announcements;
CREATE POLICY "announcements_delete_policy" 
    ON public.announcements FOR DELETE 
    USING (
        -- Only authenticated users who are not Employee or Officer can delete
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() 
            AND r.name NOT IN ('Employee', 'Officer')
        )
    );

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.announcements TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated; 