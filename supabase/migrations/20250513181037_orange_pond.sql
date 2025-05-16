/*
  # Seed data for StudyBuddy application

  1. Content
    - Adds sample departments
    - Adds sample courses for each department
    - Creates sample question papers

  This migration provides initial data to make the application usable right away.
*/

-- Insert sample departments
INSERT INTO departments (id, name, description)
VALUES
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Computer Science', 'Computer Science and Engineering Department'),
  ('6c8d9e2f-3a7b-5c1d-9e8f-0a1b2c3d4e5f', 'Information Science', 'Information Science and Engineering Department'),
  ('5a4b3c2d-1e8f-7a9b-0c1d-2e3f4a5b6c7d', 'Mechanical Engineering', 'Mechanical Engineering Department'),
  ('4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', 'Civil Engineering', 'Civil Engineering Department'),
  ('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'Electrical Engineering', 'Electrical and Electronics Engineering Department')
ON CONFLICT DO NOTHING;

-- Insert sample courses for Computer Science
INSERT INTO courses (department_id, name, code, description, semester, instructor)
VALUES
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Mathematics I', 'MVJ22MATS11', 'Calculus, Linear Algebra, and Differential Equations', 1, 'Dr. Priya Sharma'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Physics', 'MVJ22PHYS12', 'Mechanics, Thermodynamics, and Optics', 1, 'Dr. Rajesh Kumar'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Principles of Programming using C', 'MVJ22POPS13', 'Introduction to Programming with C Language', 1, 'Prof. Sunil Mehta'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Introduction to Electronics Engineering', 'MVJ22ESCK14C', 'Basic Electronics and Circuit Theory', 1, 'Dr. Ananya Desai'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Introduction To Cyber Security', 'MVJ22ETCK15I', 'Fundamentals of Cybersecurity', 1, 'Prof. Vikram Singh'),
  
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Data Structures', 'MVJ22DSCS21', 'Advanced Data Structures and Algorithms', 2, 'Prof. Meera Nair'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Object Oriented Programming', 'MVJ22OOPS22', 'OOP Concepts with Java', 2, 'Dr. Ravi Shankar'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Digital Electronics', 'MVJ22DECS23', 'Digital Logic and Computer Organization', 2, 'Prof. Aishwarya Rao'),
  
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Database Management Systems', 'MVJ22DBCS31', 'Relational Databases and SQL', 3, 'Dr. Kavita Iyer'),
  ('8f7b5a3e-1d9c-4e8a-b9e6-c7f1b2a3d4e5', 'Computer Networks', 'MVJ22CNCS32', 'Network Architecture and Protocols', 3, 'Prof. Ajay Verma')
ON CONFLICT DO NOTHING;

-- Insert sample courses for Information Science
INSERT INTO courses (department_id, name, code, description, semester, instructor)
VALUES
  ('6c8d9e2f-3a7b-5c1d-9e8f-0a1b2c3d4e5f', 'Data Science Fundamentals', 'MVJ22DSIS21', 'Introduction to Data Science and Analytics', 2, 'Dr. Neha Gupta'),
  ('6c8d9e2f-3a7b-5c1d-9e8f-0a1b2c3d4e5f', 'Machine Learning', 'MVJ22MLIS31', 'Supervised and Unsupervised Learning Algorithms', 3, 'Prof. Arjun Singh')
ON CONFLICT DO NOTHING;

-- Insert sample question papers
INSERT INTO question_papers (course_id, year, title, file_url)
SELECT 
  c.id,
  y.year,
  c.name || ' - ' || y.year || ' Question Paper',
  'https://example.com/papers/' || c.code || '_' || y.year || '.pdf'
FROM 
  courses c,
  (VALUES (2023), (2022), (2021), (2020)) as y(year)
WHERE 
  c.semester = 1
ON CONFLICT DO NOTHING;