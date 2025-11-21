-- Run this in the Supabase Dashboard SQL Editor to fix the RLS errors

-- 1. Allow users to insert their own profile (Fixes "new row violates row-level security policy" on save)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 2. Allow users to view ALL profiles (Fixes "Unknown User" in Discussion Forum)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Ensure departments are readable
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;

CREATE POLICY "Anyone can view departments" 
ON public.departments 
FOR SELECT 
TO authenticated 
USING (true);
