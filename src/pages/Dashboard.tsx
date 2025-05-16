import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, BookOpen } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface Department {
  id: string;
  name: string;
  description: string;
}

interface QuestionPaper {
  id: string;
  year: number;
  title: string;
  file_url: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (deptError) throw deptError;
        setDepartments(deptData || []);

        // Fetch recent question papers
        const { data: paperData, error: paperError } = await supabase
          .from('question_papers')
          .select(`
            id,
            year,
            title,
            file_url,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (paperError) throw paperError;
        setQuestionPapers(paperData || []);

        // Fetch recent announcements (you'll need to create this table)
        const { data: announceData, error: announceError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (announceError) throw announceError;
        setAnnouncements(announceData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

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
      <main className="container mx-auto px-4 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Departments Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Departments
              </h2>
              <p className="text-text-secondary text-sm mb-4">Access the notes</p>
              
              <div className="space-y-2">
                {departments.map((dept) => (
                  <Link 
                    key={dept.id}
                    to={`/department/${dept.id}`}
                    className="block p-3 bg-card-hover rounded-md hover:bg-opacity-80 transition-colors"
                  >
                    {dept.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content - Previous Year Papers */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Recent Question Papers
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {questionPapers.map((paper) => (
                  <Link 
                    key={paper.id}
                    to={paper.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-card-hover rounded-md hover:bg-opacity-80 transition-colors"
                  >
                    <h3 className="font-medium mb-2">{paper.title}</h3>
                    <p className="text-text-secondary text-sm">Year: {paper.year}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* What's New Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-5">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                What's New?
              </h2>
              
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const date = new Date(announcement.created_at);
                  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={announcement.id}
                      className="p-4 bg-card-hover rounded-md"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <p className="text-text-muted text-xs flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {daysAgo} days ago
                        </p>
                      </div>
                      <p className="text-text-secondary line-clamp-3">{announcement.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;