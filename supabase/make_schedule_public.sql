-- Allow users to view ALL schedules (Public Calendar)
DROP POLICY IF EXISTS "Users can view own schedules" ON public.schedules;

CREATE POLICY "Users can view all schedules" 
ON public.schedules 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure users can still only manage their OWN schedules
-- (These policies should already exist, but re-affirming them is safe)
-- Note: We don't need to drop/recreate these if they are already correct, 
-- but the previous migration had "Users can create own schedules" etc.
-- which used (auth.uid() = user_id). That is correct for editing/deleting.
