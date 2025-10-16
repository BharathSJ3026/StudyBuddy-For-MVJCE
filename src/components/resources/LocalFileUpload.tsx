import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LocalFileUploadProps {
  courseId: string;
  onUploadSuccess?: (resourceId: string) => void;
  onUploadError?: (error: string) => void;
}

const LocalFileUpload: React.FC<LocalFileUploadProps> = ({
  courseId,
  onUploadSuccess,
  onUploadError
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      onUploadError?.('Please select a file and provide a title');
      return;
    }

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));

      const { data, error } = await supabase.rpc('upload_resource_file', {
        p_course_id: courseId,
        p_title: title,
        p_description: description || null,
        p_file_data: base64String,
        p_file_name: file.name,
        p_file_type: file.type || 'application/octet-stream'
      });

      if (error) {
        throw error;
      }

      onUploadSuccess?.(data);
      
      setFile(null);
      setTitle('');
      setDescription('');
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Upload File from Local Storage</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter resource title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter resource description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !title.trim() || isUploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
};

export default LocalFileUpload; 