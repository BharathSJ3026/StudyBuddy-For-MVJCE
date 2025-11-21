-- Clear mock data from resources and courses tables
-- This will remove all existing courses and resources

-- Disable triggers temporarily if needed (optional, but good practice if there are complex triggers)
-- ALTER TABLE resources DISABLE TRIGGER ALL;
-- ALTER TABLE courses DISABLE TRIGGER ALL;

-- Delete all data from resources table
DELETE FROM resources;

-- Delete all data from courses table
DELETE FROM courses;

-- Re-enable triggers
-- ALTER TABLE resources ENABLE TRIGGER ALL;
-- ALTER TABLE courses ENABLE TRIGGER ALL;
