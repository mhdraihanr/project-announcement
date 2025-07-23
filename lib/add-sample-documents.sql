-- Add sample documents for testing (only if table is empty)
INSERT INTO documents (
    name, 
    type, 
    size, 
    content_url,
    uploaded_by, 
    department, 
    departments,
    access_level, 
    access_levels,
    downloads, 
    views, 
    shared,
    created_at,
    updated_at
) VALUES 
-- Sample documents with different access levels
(
    'Company Handbook.pdf',
    'pdf',
    '2.5 MB',
    'https://example.com/handbook.pdf',
    (SELECT id FROM users LIMIT 1), -- Use first user as uploader
    'HR',
    ARRAY['HR', 'All'],
    'Employee',
    ARRAY['Employee', 'Officer', 'VP', 'Senior VP'],
    15,
    45,
    true,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    'Q4 Financial Report.xlsx',
    'spreadsheet',
    '1.8 MB',
    'https://example.com/q4-report.xlsx',
    (SELECT id FROM users LIMIT 1),
    'Finance',
    ARRAY['Finance', 'Management'],
    'VP',
    ARRAY['VP', 'Senior VP'],
    8,
    23,
    false,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    'IT Security Guidelines.docx',
    'document',
    '856 KB',
    'https://example.com/security.docx',
    (SELECT id FROM users LIMIT 1),
    'IT',
    ARRAY['IT', 'All'],
    'Officer',
    ARRAY['Officer', 'VP', 'Senior VP'],
    32,
    87,
    true,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
),
(
    'Executive Summary 2024.pdf',
    'pdf',
    '3.2 MB',
    'https://example.com/exec-summary.pdf',
    (SELECT id FROM users LIMIT 1),
    'Management',
    ARRAY['Management'],
    'Senior VP',
    ARRAY['Senior VP'],
    5,
    12,
    false,
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    'Employee Benefits Guide.pdf',
    'pdf',
    '1.2 MB',
    'https://example.com/benefits.pdf',
    (SELECT id FROM users LIMIT 1),
    'HR',
    ARRAY['HR', 'All'],
    'Employee',
    ARRAY['Employee', 'Officer', 'VP', 'Senior VP'],
    67,
    156,
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
)
ON CONFLICT DO NOTHING;

-- Check what was inserted
SELECT COUNT(*) as total_documents_after_insert FROM documents;
SELECT name, access_level, department, departments FROM documents ORDER BY created_at DESC; 