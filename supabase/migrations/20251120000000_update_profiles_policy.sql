-- Update profiles policy to allow everyone to view profiles (usernames)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);
