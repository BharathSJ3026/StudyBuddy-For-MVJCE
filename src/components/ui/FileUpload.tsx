import React, { useState, useRef } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded: (fileUrl: string, fileType: string, fileSize: string) => void;
  onUploadStart?: () => void;
  onUploadError?: () => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onUploadStart,
  onUploadError,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { supabase } = useSupabase();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast.error(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    // Check file size
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setIsUploading(true);
    onUploadStart?.();

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      console.log('Starting file upload...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        path: filePath
      });

      // First, check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();

      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        throw new Error('Failed to check storage buckets');
      }

      console.log('Available buckets:', buckets);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('study-resources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Verify the file was uploaded
      const { data: files, error: listError } = await supabase.storage
        .from('study-resources')
        .list('resources');

      if (listError) {
        console.error('Error listing files:', listError);
        throw new Error('Failed to verify file upload');
      }

      console.log('Files in storage after upload:', files);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('study-resources')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully. Public URL:', publicUrl);

      // Format file size
      const fileSize = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Call the callback with the file URL and metadata
      onFileUploaded(publicUrl, file.type, fileSize);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onUploadError?.();
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
          disabled={isUploading}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-black">{selectedFile.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedFile();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop your file here, or{' '}
              <span className="text-primary font-medium cursor-pointer hover:text-primary-dark">browse</span>
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: {acceptedFileTypes.join(', ')}
              <br />
              Max size: {maxFileSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 