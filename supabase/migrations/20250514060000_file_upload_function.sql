/*
  # File Upload Function Migration

  This migration creates functions to upload files from local storage directly into the resources table.
  It handles both the resource record creation and storage bucket integration.
*/

-- Create function to upload file from local storage to resources table
CREATE OR REPLACE FUNCTION public.upload_resource_file(
  p_course_id uuid,
  p_title text,
  p_file_data bytea,
  p_file_name text,
  p_description text DEFAULT NULL,
  p_file_type text DEFAULT 'application/pdf',
  p_uploaded_by text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_resource_id uuid;
  v_file_path text;
  v_file_size text;
  v_mime_type text;
BEGIN
  -- Generate resource ID
  v_resource_id := gen_random_uuid();
  
  -- Calculate file size
  v_file_size := pg_size_pretty(octet_length(p_file_data));
  
  -- Determine mime type from file extension
  v_mime_type := CASE 
    WHEN lower(p_file_name) LIKE '%.pdf' THEN 'application/pdf'
    WHEN lower(p_file_name) LIKE '%.doc' THEN 'application/msword'
    WHEN lower(p_file_name) LIKE '%.docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    WHEN lower(p_file_name) LIKE '%.txt' THEN 'text/plain'
    WHEN lower(p_file_name) LIKE '%.jpg' OR lower(p_file_name) LIKE '%.jpeg' THEN 'image/jpeg'
    WHEN lower(p_file_name) LIKE '%.png' THEN 'image/png'
    ELSE p_file_type
  END;
  
  -- Create file path
  v_file_path := 'resources/' || v_resource_id::text || '/' || p_file_name;
  
  -- Insert into storage.objects
  INSERT INTO storage.objects (
    bucket_id,
    name,
    owner,
    metadata
  ) VALUES (
    'study-resources',
    v_file_path,
    COALESCE(p_uploaded_by::uuid, auth.uid()),
    jsonb_build_object(
      'mimetype', v_mime_type,
      'size', v_file_size,
      'resource_id', v_resource_id,
      'title', p_title,
      'course_id', p_course_id
    )
  );
  
  -- Insert into resources table
  INSERT INTO resources (
    id,
    course_id,
    title,
    description,
    file_url,
    file_type,
    file_size,
    uploaded_by,
    type
  ) VALUES (
    v_resource_id,
    p_course_id,
    p_title,
    p_description,
    v_file_path,
    v_mime_type,
    v_file_size,
    p_uploaded_by,
    CASE 
      WHEN v_mime_type LIKE 'image/%' THEN 'image'
      WHEN v_mime_type LIKE 'application/pdf' THEN 'pdf'
      ELSE 'document'
    END
  );
  
  RETURN v_resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to upload multiple files at once
CREATE OR REPLACE FUNCTION public.upload_multiple_resource_files(
  p_course_id uuid,
  p_files jsonb -- Array of file objects: [{"title": "...", "file_data": "...", "file_name": "...", "description": "..."}]
)
RETURNS uuid[] AS $$
DECLARE
  v_file_record jsonb;
  v_resource_ids uuid[] := '{}';
  v_resource_id uuid;
  v_file_data bytea;
  v_title text;
  v_file_name text;
  v_description text;
  v_file_type text;
BEGIN
  -- Loop through each file in the array
  FOR v_file_record IN SELECT * FROM jsonb_array_elements(p_files)
  LOOP
    -- Extract file data from base64
    v_file_data := decode(v_file_record->>'file_data', 'base64');
    v_title := v_file_record->>'title';
    v_file_name := v_file_record->>'file_name';
    v_description := v_file_record->>'description';
    v_file_type := COALESCE(v_file_record->>'file_type', 'application/pdf');
    
    -- Upload single file
    v_resource_id := public.upload_resource_file(
      p_course_id,
      v_title,
      v_file_data,
      v_file_name,
      v_description,
      v_file_type
    );
    
    -- Add to result array
    v_resource_ids := array_append(v_resource_ids, v_resource_id);
  END LOOP;
  
  RETURN v_resource_ids;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to upload multiple files: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get file content from storage
CREATE OR REPLACE FUNCTION public.get_resource_file_content(p_resource_id uuid)
RETURNS TABLE(
  file_name text,
  file_content bytea,
  mime_type text,
  file_size text
) AS $$
DECLARE
  v_file_path text;
  v_storage_object storage.objects;
BEGIN
  -- Get the file path from resources table
  SELECT file_url INTO v_file_path 
  FROM resources 
  WHERE id = p_resource_id;
  
  IF v_file_path IS NULL THEN
    RAISE EXCEPTION 'Resource not found';
  END IF;
  
  -- Get storage object
  SELECT * INTO v_storage_object 
  FROM storage.objects 
  WHERE bucket_id = 'study-resources' 
  AND name = v_file_path;
  
  IF v_storage_object IS NULL THEN
    RAISE EXCEPTION 'File not found in storage';
  END IF;
  
  -- Return file information
  RETURN QUERY SELECT 
    split_part(v_file_path, '/', -1)::text as file_name,
    v_storage_object.metadata->>'file_content'::bytea as file_content,
    v_storage_object.metadata->>'mimetype'::text as mime_type,
    v_storage_object.metadata->>'size'::text as file_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.upload_resource_file TO authenticated;
GRANT EXECUTE ON FUNCTION public.upload_multiple_resource_files TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_resource_file_content TO authenticated;

-- Create a simple function to test file upload (for development)
CREATE OR REPLACE FUNCTION public.test_file_upload()
RETURNS text AS $$
DECLARE
  v_test_data bytea;
  v_resource_id uuid;
BEGIN
  -- Create a simple test file content
  v_test_data := 'Hello, this is a test file content!'::bytea;
  
  -- Upload test file
  v_resource_id := public.upload_resource_file(
    '00000000-0000-0000-0000-000000000000'::uuid, -- dummy course_id
    'Test File',
    v_test_data,
    'test.txt',
    'This is a test file uploaded via function',
    'text/plain'
  );
  
  RETURN 'Test file uploaded successfully with ID: ' || v_resource_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for test function
GRANT EXECUTE ON FUNCTION public.test_file_upload TO authenticated; 