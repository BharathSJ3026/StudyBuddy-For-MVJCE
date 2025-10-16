/*
  # Create Storage Bucket Migration

  This migration ensures the study-resources storage bucket exists
  and sets up the necessary storage configuration.
*/

-- Create storage bucket for study resources if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'study-resources'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'study-resources', 
      'study-resources', 
      true,
      52428800, -- 50MB file size limit
      ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
      ]
    );
  END IF;
END $$;

-- Ensure storage policies exist (in case they were not created in the main migration)
DO $$
BEGIN
  -- Public Access Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'study-resources');
  END IF;

  -- Authenticated users can upload files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload files'
  ) THEN
    CREATE POLICY "Authenticated users can upload files"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'study-resources'
        AND auth.role() = 'authenticated'
      );
  END IF;

  -- Users can update their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can update their own files'
  ) THEN
    CREATE POLICY "Users can update their own files"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'study-resources'
        AND auth.uid() = owner
      );
  END IF;

  -- Users can delete their own files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can delete their own files'
  ) THEN
    CREATE POLICY "Users can delete their own files"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'study-resources'
        AND auth.uid() = owner
      );
  END IF;
END $$; 