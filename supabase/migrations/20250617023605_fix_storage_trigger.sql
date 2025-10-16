/*
  # Fix Storage Trigger Migration

  This migration fixes the storage trigger to work properly with file uploads from the application.
  The trigger should not interfere with files that are already uploaded to storage.
*/

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_resource_insert ON resources;
DROP FUNCTION IF EXISTS public.handle_resource_insert();

-- Create improved function to handle resource insert
CREATE OR REPLACE FUNCTION public.handle_resource_insert()
RETURNS TRIGGER AS $$
DECLARE
  file_path text;
  file_name text;
  existing_object storage.objects;
BEGIN
  -- If file_url already contains a storage path, don't create a new storage entry
  IF NEW.file_url IS NOT NULL AND NEW.file_url LIKE 'resources/%' THEN
    -- Check if the storage object already exists
    SELECT * INTO existing_object 
    FROM storage.objects 
    WHERE bucket_id = 'study-resources' 
    AND name = NEW.file_url;
    
    -- If storage object exists, just return NEW without modification
    IF existing_object IS NOT NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Only create storage entry if file_url is not a storage path or doesn't exist
  IF NEW.file_url IS NULL OR NEW.file_url NOT LIKE 'resources/%' THEN
    -- Extract file name from file_url if it exists
    IF NEW.file_url IS NOT NULL AND NEW.file_url LIKE 'http%' THEN
      file_name := split_part(NEW.file_url, '/', -1);
      file_path := 'resources/' || NEW.id::text || '/' || file_name;
    ELSE
      -- Generate a default file path if no file_url is provided
      file_name := NEW.title || '.' || COALESCE(NEW.file_type, 'pdf');
      file_path := 'resources/' || NEW.id::text || '/' || file_name;
    END IF;

    -- Insert into storage.objects table
    INSERT INTO storage.objects (
      bucket_id,
      name,
      owner,
      metadata
    ) VALUES (
      'study-resources',
      file_path,
      COALESCE(NEW.uploaded_by::uuid, auth.uid()),
      jsonb_build_object(
        'mimetype', COALESCE(NEW.file_type, 'application/pdf'),
        'size', COALESCE(NEW.file_size, '0'),
        'resource_id', NEW.id,
        'title', NEW.title,
        'course_id', NEW.course_id
      )
    );

    -- Update the file_url in the resources table with the storage path
    NEW.file_url := file_path;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to create storage entry for resource %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on resource insert
CREATE TRIGGER on_resource_insert
  BEFORE INSERT ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_resource_insert();

-- Also update the update trigger to be more robust
DROP TRIGGER IF EXISTS on_resource_update ON resources;
DROP FUNCTION IF EXISTS public.handle_resource_update();

CREATE OR REPLACE FUNCTION public.handle_resource_update()
RETURNS TRIGGER AS $$
DECLARE
  file_path text;
  file_name text;
BEGIN
  -- Only update storage if file_url has changed and is not already a storage path
  IF OLD.file_url IS DISTINCT FROM NEW.file_url AND 
     (NEW.file_url IS NULL OR NEW.file_url NOT LIKE 'resources/%') THEN
    
    -- Delete old storage entry if it exists and is a storage path
    IF OLD.file_url LIKE 'resources/%' THEN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'study-resources' 
      AND name = OLD.file_url;
    END IF;

    -- Create new storage entry
    IF NEW.file_url IS NOT NULL AND NEW.file_url LIKE 'http%' THEN
      file_name := split_part(NEW.file_url, '/', -1);
      file_path := 'resources/' || NEW.id::text || '/' || file_name;
    ELSE
      file_name := NEW.title || '.' || COALESCE(NEW.file_type, 'pdf');
      file_path := 'resources/' || NEW.id::text || '/' || file_name;
    END IF;

    -- Insert new storage entry
    INSERT INTO storage.objects (
      bucket_id,
      name,
      owner,
      metadata
    ) VALUES (
      'study-resources',
      file_path,
      COALESCE(NEW.uploaded_by::uuid, auth.uid()),
      jsonb_build_object(
        'mimetype', COALESCE(NEW.file_type, 'application/pdf'),
        'size', COALESCE(NEW.file_size, '0'),
        'resource_id', NEW.id,
        'title', NEW.title,
        'course_id', NEW.course_id
      )
    );

    -- Update the file_url
    NEW.file_url := file_path;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update storage entry for resource %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on resource update
CREATE TRIGGER on_resource_update
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_resource_update();
