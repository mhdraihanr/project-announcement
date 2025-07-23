-- Add access_levels column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS access_levels TEXT[] DEFAULT '{}';

-- Update existing documents to have access_levels array based on single access_level field
UPDATE documents 
SET access_levels = CASE 
    WHEN access_level IS NOT NULL AND access_level != '' THEN ARRAY[access_level]
    ELSE ARRAY['Employee']
END
WHERE access_levels = '{}' OR access_levels IS NULL;

-- Show updated table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND table_schema = 'public'
ORDER BY ordinal_position; 