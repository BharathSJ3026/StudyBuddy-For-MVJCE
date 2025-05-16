/*
  # Add announcements table

  1. New Tables
    - `announcements` - Stores system-wide announcements
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on announcements table
    - Add policies for viewing announcements
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some sample announcements
INSERT INTO announcements (title, content) VALUES
  ('Welcome to StudyBuddy!', 'We''re excited to launch our new platform for MVJCE students. Start exploring resources and connecting with your peers.'),
  ('New Resources Added', 'Check out the latest study materials added to the Computer Science department.'),
  ('Upcoming Features', 'We''re working on adding more features to help you study better. Stay tuned for updates!')
ON CONFLICT DO NOTHING;