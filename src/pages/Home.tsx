import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Book, GraduationCap, Users, Calendar, BookOpen } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      title: "Study Resources",
      description: "Access comprehensive study materials, lecture notes, and guides organized by department and semester."
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "Discussion Forums",
      description: "Connect with fellow students, ask questions, and participate in academic discussions."
    },
    {
      icon: <Calendar className="w-10 h-10 text-primary" />,
      title: "Schedule Planner",
      description: "Organize your academic schedule, set reminders for exams, and manage your study time efficiently."
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-primary" />,
      title: "Previous Papers",
      description: "Practice with previous year question papers and improve your exam preparation strategy."
    }
  ];

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

      {/* Hero Section */}
      <motion.section 
        className="relative py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen z-10"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="rounded-sm border border-cyan-500/50 bg-slate-900/80 p-4 shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
              <Book className="h-12 w-12 text-cyan-400" />
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight glitch-text"
            data-text="Study Buddy"
          >
            Study Buddy
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl md:text-3xl font-semibold mb-6 text-cyan-400 uppercase tracking-widest"
          >
            Your Ultimate Learning Companion at MVJCE
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Access study materials, connect with peers, plan your schedule, and excel in your engineering journey with StudyBuddy.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-8 py-3 font-bold uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-8 py-3 font-bold uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="border border-cyan-500 text-cyan-400 hover:bg-cyan-950 text-lg px-8 py-3 font-bold uppercase tracking-widest rounded-sm transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-wider">Everything You Need to Excel</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              StudyBuddy brings together all the tools and resources MVJCE students need to succeed in their academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-sm p-6 text-center hover:border-cyan-500/50 transition-all group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-800 group-hover:bg-cyan-500 transition-colors"></div>
                <div className="flex justify-center mb-4">
                  <div className="text-cyan-500 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10" })}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-3xl font-bold mb-6 text-white uppercase tracking-wider">Ready to Transform Your Learning Experience?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-3xl mx-auto">
            Join StudyBuddy today and gain access to a comprehensive platform designed specifically for MVJCE students.
          </p>
          
          {user ? (
            <Link 
              to="/dashboard" 
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-8 py-3 font-bold uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] inline-block"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-lg px-8 py-3 font-bold uppercase tracking-widest rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] inline-block"
            >
              Get Started Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="border border-cyan-500/30 bg-slate-900 p-2 mr-2 rounded-sm">
              <Book className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="font-bold text-lg text-slate-200 tracking-wider uppercase">StudyBuddy</span>
          </div>
          
          <div className="text-slate-600 text-sm font-mono">
            &copy; {new Date().getFullYear()} StudyBuddy for MVJCE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;