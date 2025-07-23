-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role_name TEXT NOT NULL CHECK (role_name IN ('Administrator', 'Senior VP', 'VP', 'Officer', 'Employee')),
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to view users
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- Policy to update own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'document', 'spreadsheet', 'image')),
    size TEXT NOT NULL,
    content_url TEXT,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT NOT NULL REFERENCES public.departments(name),
    access_level TEXT NOT NULL CHECK (access_level IN ('Employee', 'Officer', 'VP', 'Senior VP')),
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON public.documents(access_level);

-- Function to get role level for document access
CREATE OR REPLACE FUNCTION get_document_access_level(role_level INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN role_level <= 2 THEN 'Senior VP'
        WHEN role_level = 3 THEN 'VP'
        WHEN role_level = 4 THEN 'Officer'
        WHEN role_level = 5 THEN 'Employee'
        ELSE 'Employee'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access document based on role level
CREATE OR REPLACE FUNCTION can_access_document(doc_access_level TEXT, user_role_level INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN CASE doc_access_level
        WHEN 'Senior VP' THEN user_role_level <= 2
        WHEN 'VP' THEN user_role_level <= 3
        WHEN 'Officer' THEN user_role_level <= 4
        WHEN 'Employee' THEN user_role_level <= 5
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for viewing documents
CREATE POLICY "Users can view documents based on role level" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND can_access_document(documents.access_level, r.level)
        )
    );

-- Policy for creating documents (VP and above)
CREATE POLICY "Only VP and above can create documents" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.level <= 3  -- VP level or higher
        )
    );

-- Policy for updating documents
CREATE POLICY "Users can update their own documents or department documents if Senior VP" ON public.documents
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND (
                (r.name = 'Senior VP' AND u.department = documents.department)
                OR r.name = 'Administrator'
            )
        )
    );

-- Policy for deleting documents
CREATE POLICY "Only Admin and Senior VP can delete documents" ON public.documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.level <= 2  -- Administrator and Senior VP
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment document views
CREATE OR REPLACE FUNCTION increment_document_views(doc_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.documents
    SET views = views + 1,
        updated_at = NOW()
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment document downloads
CREATE OR REPLACE FUNCTION increment_document_downloads(doc_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.documents
    SET downloads = downloads + 1,
        updated_at = NOW()
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for document statistics
CREATE OR REPLACE VIEW public.document_statistics AS
SELECT 
    d.department,
    d.access_level,
    COUNT(*) as total_documents,
    SUM(d.views) as total_views,
    SUM(d.downloads) as total_downloads,
    COUNT(CASE WHEN d.shared THEN 1 END) as shared_documents,
    MAX(d.updated_at) as last_updated
FROM public.documents d
GROUP BY d.department, d.access_level
ORDER BY d.department, d.access_level;

-- Grant permissions
GRANT SELECT ON public.documents TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT ON public.document_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION increment_document_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_document_downloads TO authenticated; 