import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
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
        
        <div className="flex h-screen">
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 md:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 border-b border-slate-800 pb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">SYSTEM_DIRECTORY</span>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-white uppercase tracking-tighter glitch-text" data-text="DEPARTMENTS">DEPARTMENTS</h1>
              <p className="text-slate-400 max-w-2xl">
                ACCESS SECURE STUDY MATERIALS AND RESOURCES ORGANIZED BY DEPARTMENT SECTORS.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
              {departments.map((dept) => (
                <motion.div key={dept.id} variants={itemVariants}>
                  <Link to={`/department/${encodeURIComponent(dept.name)}`}>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-6 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                      {/* Hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="bg-slate-950 border border-slate-700 p-3 rounded-sm group-hover:border-cyan-500/50 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all">
                          <GraduationCap className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1 duration-300" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2 text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-wide relative z-10">
                        {dept.name}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 relative z-10 group-hover:text-slate-400 transition-colors">
                        {dept.description}
                      </p>
                      
                      {/* Corner accents */}
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-700 group-hover:border-cyan-500 transition-colors"></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {departments.length === 0 && (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-sm bg-slate-900/20">
                <div className="inline-block p-4 rounded-full bg-slate-900 mb-4 border border-slate-800">
                  <GraduationCap className="w-12 h-12 text-slate-600" />
                </div>
                <p className="text-slate-500 text-lg uppercase tracking-widest">NO DEPARTMENTS FOUND IN DATABASE</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsListPage;
