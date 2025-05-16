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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-card"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-4">
              <Book className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            Study Buddy
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl md:text-3xl font-semibold mb-6 text-text-primary"
          >
            Your Ultimate Learning Companion at MVJCE
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-text-secondary max-w-2xl mx-auto mb-8"
          >
            Access study materials, connect with peers, plan your schedule, and excel in your engineering journey with StudyBuddy.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link 
                to="/dashboard" 
                className="button-primary text-lg px-8 py-3"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="button-primary text-lg px-8 py-3"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="button-outline text-lg px-8 py-3"
                >
                  Create Account
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              StudyBuddy brings together all the tools and resources MVJCE students need to succeed in their academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card-hover rounded-lg p-6 text-center shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-text-secondary text-lg mb-8 max-w-3xl mx-auto">
            Join StudyBuddy today and gain access to a comprehensive platform designed specifically for MVJCE students.
          </p>
          
          {user ? (
            <Link 
              to="/dashboard" 
              className="button-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="button-primary text-lg px-8 py-3"
            >
              Get Started Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-2 mr-2">
              <Book className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg">StudyBuddy</span>
          </div>
          
          <div className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} StudyBuddy for MVJCE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;