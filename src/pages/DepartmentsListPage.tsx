import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface Department {
  id: string;
  name: string;
  description: string;
}

const DepartmentsListPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setDepartments(data || []);

      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
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
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-text-primary">Departments</h1>
          <p className="text-text-secondary">
            Browse notes and resources organized by department
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {departments.map((dept) => (
            <motion.div key={dept.id} variants={itemVariants}>
              <Link to={`/department/${dept.id}`}>
                <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-text-primary group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-2">
                    {dept.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No departments found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DepartmentsListPage;
