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
          {department && (
            <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">{department.name}</h1>
              <p className="text-text-secondary">{department.description}</p>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <button
                  key={semester}
                  onClick={() => setCurrentSemester(semester)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentSemester === semester
                      ? 'bg-primary text-white'
                      : 'bg-card-hover hover:bg-opacity-80'
                  }`}
                >
                  Semester {semester}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-lg overflow-hidden shadow-sm"
              >
                <div className="p-5">
                  <h3 className="font-medium text-lg mb-2">{course.name}</h3>
                  <p className="text-text-secondary text-sm mb-2">Code: {course.code}</p>
                  <p className="text-text-secondary text-sm mb-4">Instructor: {course.instructor}</p>
                  <Link
                    to={`/resource/${course.id}`}
                    className="button-primary flex items-center justify-center"
                  >
                    <Book className="w-4 h-4 mr-2" />
                    View Resources
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DepartmentPage;