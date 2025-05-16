import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Book, Video, Link as LinkIcon, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  url: string;
  size?: string;
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
  year: number;
  title: string;
  file_url: string;
  uploaded_at: string;
}

const ResourcePage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resources' | 'papers'>('resources');
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        // Simulate data loading since Supabase isn't connected yet
        setTimeout(() => {
          // Mock course data
          setCourse({
            id: resourceId || '1',
            name: 'Mathematics I',
            code: 'MVJ22MATS11',
            description: 'This course covers advanced mathematical concepts including calculus, linear algebra, and differential equations.',
            instructor: 'Dr. Priya Sharma'
          });
          
          // Mock resources data
          setResources([
            {
              id: '1',
              title: 'Lecture Notes - Calculus Fundamentals',
              type: 'pdf',
              url: '#',
              size: '2.4 MB',
              uploaded_by: 'Dr. Priya Sharma',
              uploaded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              title: 'Linear Algebra Explained - Video Tutorial',
              type: 'video',
              url: '#',
              uploaded_by: 'Dr. Priya Sharma',
              uploaded_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              title: 'Differential Equations Practice Problems',
              type: 'pdf',
              url: '#',
              size: '1.8 MB',
              uploaded_by: 'Dr. Priya Sharma',
              uploaded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '4',
              title: 'Interactive Mathematics Visualizations',
              type: 'link',
              url: 'https://www.geogebra.org/',
              uploaded_by: 'Teaching Assistant',
              uploaded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '5',
              title: 'Study Guide for Mid-term Exam',
              type: 'note',
              url: '#',
              uploaded_by: 'Student Coordinator',
              uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
          ]);

          // Mock question papers data
          setQuestionPapers([
            {
              id: '1',
              year: 2023,
              title: 'Mathematics I - 2023 Question Paper',
              file_url: '#',
              uploaded_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              year: 2022,
              title: 'Mathematics I - 2022 Question Paper',
              file_url: '#',
              uploaded_at: new Date(Date.now() - 425 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              year: 2021,
              title: 'Mathematics I - 2021 Question Paper',
              file_url: '#',
              uploaded_at: new Date(Date.now() - 790 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '4',
              year: 2020,
              title: 'Mathematics I - 2020 Question Paper',
              file_url: '#',
              uploaded_at: new Date(Date.now() - 1155 * 24 * 60 * 60 * 1000).toISOString()
            },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching resource data:', error);
        setIsLoading(false);
      }
    };

    fetchResourceData();
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
              <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2 text-primary" />
                Available Resources
              </motion.h2>

              {resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={itemVariants}
                  className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center"
                >
                  <div className="p-3 bg-card-hover rounded-full mr-4">
                    {getIconForResourceType(resource.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{resource.title}</h3>
                    <div className="flex flex-wrap text-sm text-text-muted gap-x-4">
                      <span>Uploaded by: {resource.uploaded_by}</span>
                      <span>Date: {formatDate(resource.uploaded_at)}</span>
                      {resource.size && <span>Size: {resource.size}</span>}
                    </div>
                  </div>
                  
                  <button className="button-outline flex items-center">
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
                      <span>Added: {formatDate(paper.uploaded_at)}</span>
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