-- Add departments column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- Update existing documents to have departments array based on single department field
UPDATE documents 
SET departments = CASE 
    WHEN department IS NOT NULL AND department != '' THEN ARRAY[department]
    ELSE ARRAY['All']
END
WHERE departments = '{}' OR departments IS NULL;

-- Show updated table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND table_schema = 'public'
ORDER BY ordinal_position; 