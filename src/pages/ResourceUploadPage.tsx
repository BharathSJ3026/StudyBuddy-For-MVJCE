import React, { useState } from 'react';
import LocalFileUpload from '../components/resources/LocalFileUpload';

const ResourceUploadPage: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedResources, setUploadedResources] = useState<string[]>([]);

  const handleUploadSuccess = (resourceId: string) => {
    setUploadStatus('File uploaded successfully!');
    setUploadedResources(prev => [...prev, resourceId]);
  };

  const handleUploadError = (error: string) => {
    setUploadStatus(`Upload failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Resources from Local Storage
          </h1>
          <p className="text-gray-600">
            Upload files directly from your local storage to the resources table.
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-md ${
            uploadStatus.includes('successfully') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {uploadStatus}
          </div>
        )}

        {/* Upload Component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <LocalFileUpload
              courseId="00000000-0000-0000-0000-000000000000" // Replace with actual course ID
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              How it works
            </h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </span>
                <p>Select a file from your local storage</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </span>
                <p>Provide a title and optional description</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </span>
                <p>Click upload to add the file to the resources table</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  4
                </span>
                <p>The file is automatically added to the storage bucket</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Resources List */}
        {uploadedResources.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recently Uploaded Resources
            </h3>
            <div className="bg-white rounded-lg shadow">
              <ul className="divide-y divide-gray-200">
                {uploadedResources.map((resourceId, index) => (
                  <li key={resourceId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Resource #{index + 1}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {resourceId}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceUploadPage; 