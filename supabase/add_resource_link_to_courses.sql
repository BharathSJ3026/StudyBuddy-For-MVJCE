-- Add resource_link column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS resource_link text;
