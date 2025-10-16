# Local File Upload to Resources Table

This feature allows you to upload files directly from your local storage into the resources table, with automatic storage bucket integration.

## How It Works

1. **Database Function**: The `upload_resource_file` function handles the file upload process
2. **Automatic Storage**: Files are automatically added to the Supabase storage bucket
3. **Resource Record**: A corresponding record is created in the resources table
4. **Metadata Storage**: File metadata is stored in both the resources table and storage bucket

## Database Function

### `upload_resource_file`

```sql
upload_resource_file(
  p_course_id uuid,
  p_title text,
  p_description text DEFAULT NULL,
  p_file_data bytea,
  p_file_name text,
  p_file_type text DEFAULT 'application/pdf',
  p_uploaded_by text DEFAULT NULL
) RETURNS uuid
```

**Parameters:**
- `p_course_id`: The course ID the resource belongs to
- `p_title`: The title of the resource
- `p_description`: Optional description
- `p_file_data`: The file content as bytea (base64 encoded)
- `p_file_name`: The original filename
- `p_file_type`: MIME type of the file
- `p_uploaded_by`: User ID of the uploader

**Returns:** The generated resource ID

## React Component Usage

```tsx
import LocalFileUpload from '../components/resources/LocalFileUpload';

<LocalFileUpload
  courseId="your-course-id"
  onUploadSuccess={(resourceId) => console.log('Uploaded:', resourceId)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

## File Upload Process

1. **File Selection**: User selects a file from their local storage
2. **Base64 Encoding**: File is converted to base64 string
3. **Database Call**: The `upload_resource_file` function is called
4. **Storage Creation**: File is added to the storage bucket
5. **Resource Record**: A record is created in the resources table
6. **Success Response**: The resource ID is returned

## Supported File Types

The system automatically detects file types based on extensions:
- PDF files (`.pdf`)
- Word documents (`.doc`, `.docx`)
- Text files (`.txt`)
- Images (`.jpg`, `.jpeg`, `.png`)
- Other files (defaults to `application/octet-stream`)

## Storage Structure

Files are stored in the storage bucket with the following structure:
```
resources/
├── {resource-id}/
│   ├── filename.pdf
│   ├── document.docx
│   └── image.jpg
```

## Error Handling

- File size validation
- File type validation
- Database transaction rollback on failure
- Storage cleanup on resource deletion

## Security

- Only authenticated users can upload files
- Files are associated with the uploading user
- Row Level Security (RLS) policies are enforced
- Storage bucket policies control access

## Example Usage

```tsx
// In your React component
const handleFileUpload = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64String = btoa(String.fromCharCode(...uint8Array));

  const { data, error } = await supabase.rpc('upload_resource_file', {
    p_course_id: 'your-course-id',
    p_title: 'My Document',
    p_description: 'Important study material',
    p_file_data: base64String,
    p_file_name: file.name,
    p_file_type: file.type
  });

  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload successful:', data);
  }
};
```

## Migration Files

- `20250514050000_auto_storage_trigger.sql`: Automatic storage triggers
- `20250514060000_file_upload_function.sql`: File upload functions

## Benefits

1. **Direct Integration**: No need for separate upload forms
2. **Automatic Management**: Storage and database stay in sync
3. **Batch Upload**: Support for multiple file uploads
4. **Error Recovery**: Automatic cleanup on failures
5. **Type Safety**: Automatic file type detection 