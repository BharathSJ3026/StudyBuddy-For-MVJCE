import React, { useState } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import FileUpload from '../ui/FileUpload';

interface AddResourceFormProps {
  courseId: string;
  onResourceAdded: () => void;
  onClose: () => void;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({
  courseId,
  onResourceAdded,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'video' | 'link' | 'note'>('pdf');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);

  const { supabase } = useSupabase();
  const { user } = useAuth();

  // Check if form is valid
  const isFormValid = () => {
    if (!title.trim()) return false;
    
    if (type === 'link') {
      return link.trim() !== '';
    } else {
      return fileUrl !== '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add resources');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (type === 'link' && !link.trim()) {
      toast.error('Please enter a link URL');
      return;
    }

    if (type !== 'link' && !fileUrl) {
      toast.error('Please upload a file');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract storage path from public URL for file uploads
      let fileUrlToStore = fileUrl;
      if (type !== 'link' && fileUrl) {
        // Extract the storage path from the public URL
        // Public URL format: https://xxx.supabase.co/storage/v1/object/public/study-resources/resources/filename.pdf
        // We need to extract: resources/filename.pdf
        const urlParts = fileUrl.split('/');
        const storagePathIndex = urlParts.findIndex(part => part === 'resources');
        if (storagePathIndex !== -1) {
          fileUrlToStore = urlParts.slice(storagePathIndex).join('/');
        }
      }

      const resourceData = {
        title: title.trim(),
        type,
        course_id: courseId,
        uploaded_by: user.email,
        file_url: type === 'link' ? link : fileUrlToStore,
        file_type: type === 'link' ? 'link' : fileType,
        file_size: type === 'link' ? null : fileSize,
      };

      console.log('Attempting to add resource with data:', resourceData);

      // First, verify the course exists
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error verifying course:', courseError);
        throw new Error('Invalid course ID');
      }

      console.log('Course verification successful:', courseData);

      // Insert the resource
      const { data, error } = await supabase
        .from('resources')
        .insert(resourceData)
        .select();

      if (error) {
        console.error('Error adding resource:', error);
        throw error;
      }

      console.log('Resource added successfully:', data);

      // Verify the resource was added
      const { data: verifyData, error: verifyError } = await supabase
        .from('resources')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (verifyError) {
        console.error('Error verifying resource addition:', verifyError);
      } else {
        console.log('Current resources for course:', verifyData);
      }

      toast.success('Resource added successfully!');
      onResourceAdded();
      onClose();
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error(`Failed to add resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploaded = (url: string, type: string, size: string) => {
    setFileUrl(url);
    setFileType(type);
    setFileSize(size);
    setIsFileUploading(false);
  };

  const handleFileUploadStart = () => {
    setIsFileUploading(true);
  };

  const handleFileUploadError = () => {
    setIsFileUploading(false);
  };

  const handleTypeChange = (newType: 'pdf' | 'video' | 'link' | 'note') => {
    setType(newType);
    // Clear file data when switching to link type
    if (newType === 'link') {
      setFileUrl('');
      setFileType('');
      setFileSize('');
    }
    // Clear link when switching to file types
    if (newType !== 'link') {
      setLink('');
    }
  };

  // Determine button text and disabled state
  const getButtonText = () => {
    if (isSubmitting) return 'Adding...';
    if (isFileUploading) return 'Uploading...';
    return 'Add Resource';
  };

  const isButtonDisabled = isSubmitting || isFileUploading || !isFormValid();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-black placeholder-gray-500"
          placeholder="Enter resource title"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as 'pdf' | 'video' | 'link' | 'note')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-black bg-white"
        >
          <option value="pdf">PDF Document</option>
          <option value="video">Video</option>
          <option value="link">External Link</option>
          <option value="note">Note</option>
        </select>
      </div>

      {type === 'link' ? (
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
            Link URL
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-black placeholder-gray-500"
            placeholder="https://example.com"
            required
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onUploadStart={handleFileUploadStart}
            onUploadError={handleFileUploadError}
            acceptedFileTypes={
              type === 'pdf' ? ['.pdf'] :
              type === 'video' ? ['.mp4', '.mov'] :
              ['.pdf', '.doc', '.docx', '.txt']
            }
            maxFileSize={50 * 1024 * 1024} // 50MB
          />
          {fileUrl && (
            <p className="mt-2 text-sm text-green-600">
              ✓ File uploaded successfully
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
            isButtonDisabled 
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </form>
  );
};

export default AddResourceForm; 