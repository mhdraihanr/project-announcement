-- Update existing announcements table to support multiple departments
-- First, add the missing departments column
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}';

-- Update department column to allow NULL and set default
ALTER TABLE announcements ALTER COLUMN department DROP NOT NULL;
ALTER TABLE announcements ALTER COLUMN department SET DEFAULT 'All';

-- Update any existing records that might have NULL department
UPDATE announcements SET department = 'All' WHERE department IS NULL;

-- Enable Row Level Security if not already enabled
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "announcements_select_policy" ON announcements;
DROP POLICY IF EXISTS "announcements_insert_policy" ON announcements;
DROP POLICY IF EXISTS "announcements_update_policy" ON announcements;
DROP POLICY IF EXISTS "announcements_delete_policy" ON announcements;

-- Create RLS policies
CREATE POLICY "announcements_select_policy" 
    ON announcements FOR SELECT 
    USING (true); -- Everyone can view announcements

CREATE POLICY "announcements_insert_policy" 
    ON announcements FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated'); -- Any authenticated user can create for now

CREATE POLICY "announcements_update_policy" 
    ON announcements FOR UPDATE 
    USING (auth.role() = 'authenticated'); -- Any authenticated user can update for now

CREATE POLICY "announcements_delete_policy" 
    ON announcements FOR DELETE 
    USING (auth.role() = 'authenticated'); -- Any authenticated user can delete for now

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON announcements TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Show final table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'announcements' 
AND table_schema = 'public'
ORDER BY ordinal_position; 