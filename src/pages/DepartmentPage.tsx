import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface Course {
  id: string;
  name: string;
  code: string;
  semester: number;
  instructor: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

const DepartmentPage: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setIsLoading(true);

        // Fetch department details
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('id', departmentId)
          .single();

        if (deptError) throw deptError;
        setDepartment(deptData);

        // Fetch courses for this department
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('department_id', departmentId)
          .order('semester', { ascending: true })
          .order('name', { ascending: true });

        if (courseError) throw courseError;
        setCourses(courseData || []);

      } catch (error) {
        console.error('Error fetching department:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (departmentId) {
      fetchDepartment();
    }
  }, [departmentId, supabase]);

  const filteredCourses = courses.filter(course => course.semester === currentSemester);

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
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen relative z-10">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono relative overflow-hidden selection:bg-cyan-500/30">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10"></div>

      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-36">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto"
          >
            {department && (
              <motion.div variants={itemVariants} className="bg-slate-900/80 border border-slate-800 rounded-sm p-6 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <h1 className="text-3xl font-bold mb-2 text-white uppercase tracking-widest glitch-text" data-text={department.name}>{department.name}</h1>
                <p className="text-slate-400 max-w-3xl leading-relaxed">{department.description}</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center mb-4">
                <div className="h-px flex-1 bg-slate-800"></div>
                <span className="px-4 text-xs font-bold text-cyan-500 uppercase tracking-widest">SELECT SEMESTER MODULE</span>
                <div className="h-px flex-1 bg-slate-800"></div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <button
                    key={semester}
                    onClick={() => setCurrentSemester(semester)}
                    className={`px-6 py-3 rounded-sm transition-all font-bold uppercase tracking-wider text-sm border ${
                      currentSemester === semester
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500/50 hover:text-cyan-400'
                    }`}
                  >
                    SEM {semester}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-sm overflow-hidden hover:border-cyan-500/50 transition-all group relative"
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-slate-800 group-hover:border-r-cyan-500/30 transition-colors"></div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{course.name}</h3>
                      <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded-sm">{course.code}</span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="w-24 text-slate-600 uppercase">INSTRUCTOR:</span>
                        <span className="font-mono text-cyan-500/80">{course.instructor}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="w-24 text-slate-600 uppercase">STATUS:</span>
                        <span className="text-green-500">ACTIVE</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/resource/${course.id}`}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 font-bold py-3 px-4 rounded-sm flex items-center justify-center uppercase tracking-widest text-xs transition-all group-hover:shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                    >
                      <Book className="w-3 h-3 mr-2" />
                      ACCESS RESOURCES
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-sm bg-slate-900/20">
                <div className="inline-block p-4 rounded-full bg-slate-900 mb-4 border border-slate-800">
                  <Book className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 text-lg uppercase tracking-widest">NO COURSE DATA FOUND FOR SEMESTER {currentSemester}</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DepartmentPage;