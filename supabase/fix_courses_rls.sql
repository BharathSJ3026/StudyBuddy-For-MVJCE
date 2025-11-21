-- Fix RLS policies for courses table

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert courses" ON courses;
DROP POLICY IF EXISTS "Allow public to view courses" ON courses;

-- Create policy to allow authenticated users to insert courses
CREATE POLICY "Allow authenticated users to insert courses"
ON courses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow public to view courses
CREATE POLICY "Allow public to view courses"
ON courses
FOR SELECT
TO public
USING (true);
