/*
  # Add resource types and enhance resources table

  1. Changes
    - Add resource_types table for categorizing resources
    - Add file_metadata to resources table
    - Add likes and views tracking to resources
*/

-- Create resource types table
CREATE TABLE IF NOT EXISTS resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resource types"
  ON resource_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default resource types
INSERT INTO resource_types (name, description, icon) VALUES
  ('pdf', 'PDF Documents', 'file-text'),
  ('video', 'Video Tutorials', 'video'),
  ('link', 'External Links', 'link'),
  ('note', 'Study Notes', 'book');

-- Add new columns to resources table
ALTER TABLE resources 
  ADD COLUMN IF NOT EXISTS resource_type_id uuid REFERENCES resource_types(id),
  ADD COLUMN IF NOT EXISTS views integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create view to get resources with types
CREATE OR REPLACE VIEW resource_details AS
SELECT 
  r.*,
  rt.name as type_name,
  rt.icon as type_icon,
  c.name as course_name,
  c.code as course_code,
  d.name as department_name,
  p.username as uploader_name
FROM resources r
LEFT JOIN resource_types rt ON r.resource_type_id = rt.id
LEFT JOIN courses c ON r.course_id = c.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN profiles p ON r.uploaded_by = p.id;