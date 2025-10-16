/*
  # Initial schema for StudyBuddy application

  1. New Tables
    - `profiles` - Stores user profile information
    - `departments` - Academic departments in the college
    - `courses` - Courses offered by departments
    - `resources` - Study materials for courses
    - `discussions` - Forum discussions
    - `comments` - Comments on discussions
    - `schedules` - User schedule events
    - `question_papers` - Previous year question papers

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Profiles table to store additional user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  department_id uuid,
  semester int,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view departments" 
  ON departments 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Add foreign key to profiles
ALTER TABLE profiles ADD CONSTRAINT fk_department
  FOREIGN KEY (department_id) REFERENCES departments(id);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) NOT NULL,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  semester int NOT NULL,
  instructor text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" 
  ON courses 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  file_type text,
  file_size text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources" 
  ON resources 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can upload resources" 
  ON resources 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  course_id uuid REFERENCES courses(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view discussions" 
  ON discussions 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create discussions" 
  ON discussions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions" 
  ON discussions 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" 
  ON discussions 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" 
  ON comments 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON comments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON comments 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON comments 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  event_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules" 
  ON schedules 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules" 
  ON schedules 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" 
  ON schedules 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" 
  ON schedules 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Question Papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  year int NOT NULL,
  title text NOT NULL,
  file_url text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view question papers" 
  ON question_papers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create function to create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'study-resources' );

create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'study-resources'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own files"
  on storage.objects for update
  using (
    bucket_id = 'study-resources'
    and auth.uid() = owner
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'study-resources'
    and auth.uid() = owner
  );