/*
  # Add Indexes and Constraints Migration

  This migration adds useful indexes and constraints for better performance
  and data integrity across the application.
*/

-- Add indexes for better query performance

-- Resources table indexes
CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- Discussions table indexes
CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_discussion_id ON comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Schedules table indexes
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_event_date ON schedules(event_date);
CREATE INDEX IF NOT EXISTS idx_schedules_event_type ON schedules(event_type);

-- Question papers table indexes
CREATE INDEX IF NOT EXISTS idx_question_papers_course_id ON question_papers(course_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_year ON question_papers(year);
CREATE INDEX IF NOT EXISTS idx_question_papers_uploaded_by ON question_papers(uploaded_by);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_semester ON profiles(semester);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Courses table indexes
CREATE INDEX IF NOT EXISTS idx_courses_department_id ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);

-- Add constraints for data integrity (using DO blocks to handle existing constraints)

-- Ensure file_size is not negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_file_size_positive' 
    AND conrelid = 'resources'::regclass
  ) THEN
    ALTER TABLE resources ADD CONSTRAINT check_file_size_positive 
    CHECK (file_size IS NULL OR file_size ~ '^[0-9]+(\.[0-9]+)?\s*[KMGT]?B$');
  END IF;
END $$;

-- Ensure semester is between 1 and 8
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_semester_range' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT check_semester_range 
    CHECK (semester IS NULL OR (semester >= 1 AND semester <= 8));
  END IF;
END $$;

-- Ensure course semester is between 1 and 8
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_course_semester_range' 
    AND conrelid = 'courses'::regclass
  ) THEN
    ALTER TABLE courses ADD CONSTRAINT check_course_semester_range 
    CHECK (semester >= 1 AND semester <= 8);
  END IF;
END $$;

-- Ensure question paper year is reasonable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_year_reasonable' 
    AND conrelid = 'question_papers'::regclass
  ) THEN
    ALTER TABLE question_papers ADD CONSTRAINT check_year_reasonable 
    CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1);
  END IF;
END $$;

-- Ensure schedule event_date is not in the past (allow some flexibility for recurring events)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_event_date_not_too_old' 
    AND conrelid = 'schedules'::regclass
  ) THEN
    ALTER TABLE schedules ADD CONSTRAINT check_event_date_not_too_old 
    CHECK (event_date >= CURRENT_DATE - INTERVAL '1 year');
  END IF;
END $$;

-- Add unique constraints where appropriate

-- Ensure course codes are unique within a department
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_department_code_unique 
ON courses(department_id, code);

-- Ensure usernames are unique (already handled by the table definition, but adding index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
ON profiles(username) WHERE username IS NOT NULL;

-- Add full-text search indexes for better search functionality

-- Resources full-text search (only on title since description column doesn't exist)
CREATE INDEX IF NOT EXISTS idx_resources_fts ON resources 
USING gin(to_tsvector('english', title));

-- Discussions full-text search
CREATE INDEX IF NOT EXISTS idx_discussions_fts ON discussions 
USING gin(to_tsvector('english', title || ' ' || content));

-- Comments full-text search
CREATE INDEX IF NOT EXISTS idx_comments_fts ON comments 
USING gin(to_tsvector('english', content));

-- Create a function for full-text search across resources
CREATE OR REPLACE FUNCTION search_resources(search_query text)
RETURNS TABLE(
  id uuid,
  title text,
  file_type text,
  file_size text,
  created_at timestamptz,
  rank float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.file_type,
    r.file_size,
    r.created_at,
    ts_rank(to_tsvector('english', r.title), plainto_tsquery('english', search_query)) as rank
  FROM resources r
  WHERE to_tsvector('english', r.title) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for search function
GRANT EXECUTE ON FUNCTION search_resources TO authenticated;

-- Create a function to get resource statistics
CREATE OR REPLACE FUNCTION get_resource_stats()
RETURNS TABLE(
  total_resources bigint,
  total_size text,
  file_types jsonb,
  recent_uploads bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_resources,
    pg_size_pretty(SUM(octet_length(file_url::text))) as total_size,
    jsonb_object_agg(file_type, count) as file_types,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_uploads
  FROM (
    SELECT 
      file_type,
      COUNT(*) as count
    FROM resources 
    GROUP BY file_type
  ) file_type_counts
  CROSS JOIN (
    SELECT COUNT(*) as total_count
    FROM resources
  ) total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for stats function
GRANT EXECUTE ON FUNCTION get_resource_stats TO authenticated; 