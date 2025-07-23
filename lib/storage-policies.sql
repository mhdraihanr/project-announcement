-- NOTE: Run these commands in Supabase Dashboard > Storage > Policies
-- Or use the Supabase Dashboard UI to create these policies

-- 1. First, create the bucket if it doesn't exist:
-- Go to Storage > Create Bucket > Name: "documents" > Public: true

-- 2. Then create these policies in Storage > documents bucket > Policies:

-- Policy 1: Allow authenticated users to view documents
-- Policy name: "Allow authenticated users to view documents"
-- Operation: SELECT
-- Target roles: authenticated
-- Policy definition:
-- true

-- Policy 2: Allow VP and above to upload documents  
-- Policy name: "Allow VP and above to upload documents"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition:
-- EXISTS (
--   SELECT 1 FROM public.users u
--   JOIN public.roles r ON u.role_id = r.id
--   WHERE u.id = auth.uid() AND r.level <= 3
-- )

-- Policy 3: Allow Admin and Senior VP to delete documents
-- Policy name: "Allow Admin and Senior VP to delete documents" 
-- Operation: DELETE
-- Target roles: authenticated
-- Policy definition:
-- EXISTS (
--   SELECT 1 FROM public.users u
--   JOIN public.roles r ON u.role_id = r.id
--   WHERE u.id = auth.uid() AND r.level <= 2
-- )

-- Alternative: If you have service role key, you can run this:
-- But ONLY run this if you're using service role, not anon key

/*
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (requires service role)
CREATE POLICY "documents_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "documents_insert_policy" ON storage.objects  
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.level <= 3
  )
);

CREATE POLICY "documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.level <= 2
  )
);
*/ 