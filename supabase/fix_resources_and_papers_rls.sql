-- Fix RLS policies for resources and question_papers tables

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert resources" ON resources;
DROP POLICY IF EXISTS "Allow public to view resources" ON resources;
DROP POLICY IF EXISTS "Allow authenticated users to insert question papers" ON question_papers;
DROP POLICY IF EXISTS "Allow public to view question papers" ON question_papers;

-- Create policies for resources
CREATE POLICY "Allow authenticated users to insert resources"
ON resources
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow public to view resources"
ON resources
FOR SELECT
TO public
USING (true);

-- Create policies for question_papers
CREATE POLICY "Allow authenticated users to insert question papers"
ON question_papers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow public to view question papers"
ON question_papers
FOR SELECT
TO public
USING (true);
