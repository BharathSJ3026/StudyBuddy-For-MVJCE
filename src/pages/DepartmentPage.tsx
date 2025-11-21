import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, X, ExternalLink, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  name: string;
  code: string;
  semester: number;
  instructor: string;
  resource_link?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

const DepartmentPage: React.FC = () => {
  const { departmentName } = useParams<{ departmentName: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: '',
    instructor: ''
  });
  
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setIsLoading(true);

        if (!departmentName) return;

        // Fetch department details by name
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('name', decodeURIComponent(departmentName))
          .single();

        if (deptError) throw deptError;
        setDepartment(deptData);

        // Fetch courses for this department using the fetched ID
        if (deptData) {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('department_id', deptData.id)
            .order('semester', { ascending: true })
            .order('name', { ascending: true });

          if (courseError) throw courseError;
          setCourses(courseData || []);
        }

      } catch (error) {
        console.error('Error fetching department:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (departmentName) {
      fetchDepartment();
    }
  }, [departmentName, supabase]);

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code || !department?.id) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          department_id: department.id,
          name: newCourse.name,
          code: newCourse.code,
          description: newCourse.description,
          semester: currentSemester,
          instructor: newCourse.instructor
        })
        .select()
        .single();

      if (error) throw error;

      setCourses([...courses, data]);
      setShowAddCourseModal(false);
      setNewCourse({
        name: '',
        code: '',
        description: '',
        instructor: ''
      });
      toast.success('Course added successfully');
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course');
    }
  };

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
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-cyan-500 hover:text-cyan-400 mb-6 transition-colors uppercase tracking-widest text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO DEPARTMENTS
            </button>

            {department && (
              <motion.div variants={itemVariants} className="bg-slate-900/80 border border-slate-800 rounded-sm p-6 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <h1 className="text-3xl font-bold mb-2 text-white uppercase tracking-widest glitch-text" data-text={department.name}>{department.name}</h1>
                <p className="text-slate-400 max-w-3xl leading-relaxed">{department.description}</p>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center flex-1">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="px-4 text-xs font-bold text-cyan-500 uppercase tracking-widest">SELECT SEMESTER MODULE</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                
                {user && (
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="ml-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    ADD COURSE
                  </button>
                )}
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
                    
                    {/* Access Resources Button */}
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
                {user && (
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="mt-4 text-cyan-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest"
                  >
                    ADD FIRST COURSE
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Add Course Modal */}
          <AnimatePresence>
            {showAddCourseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-sm shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">Add New Course</h2>
                      <button 
                        onClick={() => setShowAddCourseModal(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Course Name</label>
                        <input
                          type="text"
                          value={newCourse.name}
                          onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                          placeholder="e.g. Database Management Systems"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Course Code</label>
                          <input
                            type="text"
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                            placeholder="e.g. 18CS53"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Semester</label>
                          <div className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm text-slate-500 text-sm font-mono">
                            SEMESTER {currentSemester}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Instructor Name</label>
                        <input
                          type="text"
                          value={newCourse.instructor}
                          onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                          placeholder="e.g. Dr. Smith"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          placeholder="Brief description of the course..."
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono resize-none"
                        />
                      </div>

                      <button
                        onClick={handleAddCourse}
                        disabled={!newCourse.name || !newCourse.code}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-sm transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)] mt-2"
                      >
                        ADD COURSE TO DATABASE
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DepartmentPage;