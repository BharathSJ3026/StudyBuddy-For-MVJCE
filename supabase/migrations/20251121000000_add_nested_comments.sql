-- Add parent_id to comments table to support nested replies
ALTER TABLE public.comments 
ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
