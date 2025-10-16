/*
  # Auto Storage Trigger Migration

  This migration creates a trigger function that automatically creates storage bucket entries
  when resources are added directly to the resources table through the database editor.
*/

-- Create function to automatically create storage bucket entry when resource is added
CREATE OR REPLACE FUNCTION public.handle_resource_insert()
RETURNS TRIGGER AS $$
DECLARE
  file_path text;
  file_name text;
BEGIN
  -- Extract file name from file_url if it exists
  IF NEW.file_url IS NOT NULL THEN
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
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to create storage entry for resource %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on resource insert
DROP TRIGGER IF EXISTS on_resource_insert ON resources;
CREATE TRIGGER on_resource_insert
  AFTER INSERT ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_resource_insert();

-- Create function to handle resource updates
CREATE OR REPLACE FUNCTION public.handle_resource_update()
RETURNS TRIGGER AS $$
DECLARE
  file_path text;
  file_name text;
BEGIN
  -- Only update storage if file_url has changed
  IF OLD.file_url IS DISTINCT FROM NEW.file_url THEN
    -- Delete old storage entry if it exists
    DELETE FROM storage.objects 
    WHERE bucket_id = 'study-resources' 
    AND name LIKE 'resources/' || OLD.id::text || '/%';

    -- Create new storage entry
    IF NEW.file_url IS NOT NULL THEN
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
DROP TRIGGER IF EXISTS on_resource_update ON resources;
CREATE TRIGGER on_resource_update
  AFTER UPDATE ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_resource_update();

-- Create function to handle resource deletion
CREATE OR REPLACE FUNCTION public.handle_resource_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete associated storage entries when resource is deleted
  DELETE FROM storage.objects 
  WHERE bucket_id = 'study-resources' 
  AND name LIKE 'resources/' || OLD.id::text || '/%';
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to delete storage entries for resource %: %', OLD.id, SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on resource delete
DROP TRIGGER IF EXISTS on_resource_delete ON resources;
CREATE TRIGGER on_resource_delete
  AFTER DELETE ON resources
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_resource_delete(); 