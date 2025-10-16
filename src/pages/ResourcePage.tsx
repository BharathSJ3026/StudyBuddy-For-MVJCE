import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Book, Video, Link as LinkIcon, Calendar, Plus } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AddResourceForm from '../components/resources/AddResourceForm';
import { useSupabase } from '../contexts/SupabaseContext';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  file_url: string;
  file_type: string;
  file_size: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  instructor: string;
}

interface QuestionPaper {
  id: string;
  title: string;
  year: number;
  file_url: string;
  created_at: string;
}

const ResourcePage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resources' | 'papers'>('resources');
  const [showAddResource, setShowAddResource] = useState(false);
  
  const { supabase } = useSupabase();

  const fetchResourceData = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to fetch resource data for course:', resourceId);

      // First, verify the course exists
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }

      if (!courseData) {
        console.error('Course not found:', resourceId);
        throw new Error('Course not found');
      }

      console.log('Course data fetched successfully:', courseData);
      setCourse(courseData);

      // Fetch resources for this course
      console.log('Fetching resources for course:', resourceId);
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('course_id', resourceId)
        .order('created_at', { ascending: false });

      if (resourceError) {
        console.error('Error fetching resources:', resourceError);
        throw resourceError;
      }

      console.log('Resources fetched successfully:', resourceData);
      setResources(resourceData || []);

      // Fetch question papers for this course
      console.log('Fetching question papers for course:', resourceId);
      const { data: paperData, error: paperError } = await supabase
        .from('question_papers')
        .select('*')
        .eq('course_id', resourceId)
        .order('year', { ascending: false });

      if (paperError) {
        console.error('Error fetching question papers:', paperError);
        throw paperError;
      }

      console.log('Question papers fetched successfully:', paperData);
      setQuestionPapers(paperData || []);

    } catch (error) {
      console.error('Error in fetchResourceData:', error);
      toast.error('Failed to load resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchResourceData();
    }
  }, [resourceId, supabase]);

  const getIconForResourceType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      case 'note':
        return <Book className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const handleResourceAdded = () => {
    // Refresh resources list
    fetchResourceData();
  };

  const handleDownload = async (resource: Resource) => {
    try {
      if (resource.type === 'link') {
        window.open(resource.file_url, '_blank');
        return;
      }

      console.log('Starting download process...');
      console.log('Resource details:', {
        title: resource.title,
        type: resource.type,
        file_url: resource.file_url,
        file_type: resource.file_type,
        file_size: resource.file_size
      });

      // Extract the file path from the URL
      const urlParts = resource.file_url.split('/');
      const encodedFileName = urlParts[urlParts.length - 1];
      const fileName = decodeURIComponent(encodedFileName);
      const filePath = `resources/${fileName}`;
      
      console.log('File path details:', {
        encodedFileName,
        fileName,
        filePath
      });

      if (!filePath) {
        throw new Error('Invalid file path');
      }

      // First, check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage
        .listBuckets();

      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        throw new Error('Failed to check storage buckets');
      }

      console.log('Available buckets:', buckets);

      // Check if the file exists
      const { data: existsData, error: existsError } = await supabase.storage
        .from('study-resources')
        .list('resources');

      if (existsError) {
        console.error('Error checking file existence:', existsError);
        throw new Error('Failed to verify file existence');
      }

      console.log('Files in storage:', existsData);

      // Check for both encoded and decoded versions of the filename
      const fileExists = existsData?.some(file => 
        file.name === fileName || 
        file.name === encodedFileName ||
        file.name.toLowerCase() === fileName.toLowerCase() ||
        file.name.toLowerCase() === encodedFileName.toLowerCase()
      );

      if (!fileExists) {
        const availableFiles = existsData?.map(f => f.name).join(', ') || 'No files found';
        console.error('File not found. Available files:', availableFiles);
        throw new Error(`File not found in storage. Looking for: ${fileName}. Available files: ${availableFiles}`);
      }

      // Use the actual filename from storage if it exists
      const actualFileName = existsData?.find(file => 
        file.name === fileName || 
        file.name === encodedFileName ||
        file.name.toLowerCase() === fileName.toLowerCase() ||
        file.name.toLowerCase() === encodedFileName.toLowerCase()
      )?.name || fileName;

      console.log('Using actual filename:', actualFileName);

      // Fetch the file from Supabase storage
      const { data, error } = await supabase.storage
        .from('study-resources')
        .download(`resources/${actualFileName}`);

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`Storage error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from storage');
      }

      // Get the original file name from the resource title
      const downloadFileName = resource.title.replace(/[^a-zA-Z0-9.-]/g, '_') + 
        (resource.file_url.includes('.pdf') ? '.pdf' : 
         resource.file_url.includes('.mp4') ? '.mp4' : 
         resource.file_url.includes('.doc') ? '.doc' : 
         resource.file_url.includes('.txt') ? '.txt' : '');

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {course && (
            <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                  {course.code}
                </span>
                <span className="px-3 py-1 bg-card-hover rounded-full text-sm">
                  Instructor: {course.instructor}
                </span>
              </div>
              <p className="text-text-secondary">{course.description}</p>
            </motion.div>
          )}

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'resources'
                  ? 'bg-primary text-white'
                  : 'bg-card-hover hover:bg-opacity-80'
              }`}
            >
              Study Resources
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'papers'
                  ? 'bg-primary text-white'
                  : 'bg-card-hover hover:bg-opacity-80'
              }`}
            >
              Question Papers
            </button>
          </div>

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <motion.h2 variants={itemVariants} className="text-xl font-semibold flex items-center">
                  <Book className="w-5 h-5 mr-2 text-primary" />
                  Available Resources
                </motion.h2>
                <button
                  onClick={() => setShowAddResource(true)}
                  className="button-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </button>
              </div>

              {resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={itemVariants}
                  className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center"
                >
                  <div className="p-3 bg-card-hover rounded-full mr-4">
                    {getIconForResourceType(resource.file_type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{resource.title}</h3>
                    <div className="flex flex-wrap text-sm text-text-muted gap-x-4">
                      <span>Uploaded by: {resource.uploaded_by}</span>
                      <span>Date: {formatDate(resource.uploaded_at)}</span>
                      {resource.file_size && <span>Size: {resource.file_size}</span>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDownload(resource)}
                    className="button-outline flex items-center"
                  >
                    {resource.type === 'link' ? (
                      <>
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Visit
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </>
                    )}
                  </button>
                </motion.div>
              ))}

              {showAddResource && course && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold mb-4">Add New Resource</h3>
                    <AddResourceForm
                      courseId={course.id}
                      onResourceAdded={handleResourceAdded}
                      onClose={() => setShowAddResource(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'papers' && (
            <div className="space-y-4">
              <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Previous Year Question Papers
              </motion.h2>

              {questionPapers.map((paper) => (
                <motion.div
                  key={paper.id}
                  variants={itemVariants}
                  className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center"
                >
                  <div className="p-3 bg-card-hover rounded-full mr-4">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{paper.title}</h3>
                    <div className="flex flex-wrap text-sm text-text-muted gap-x-4">
                      <span>Year: {paper.year}</span>
                      <span>Added: {formatDate(paper.created_at)}</span>
                    </div>
                  </div>
                  
                  <button className="button-outline flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ResourcePage;