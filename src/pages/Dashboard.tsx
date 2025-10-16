import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';


const Dashboard: React.FC = () => {
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
      icon: <BookOpen className="w-12 h-12" />,
      title: "Notes",
      description: "Access comprehensive notes for all VTU engineering courses organized by department and semester",
      buttonText: "Browse Notes",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      link: "/departments"
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Quiz Generator",
      description: "Generate custom quizzes based on your course materials to test your knowledge and prepare for exams",
      buttonText: "Create Quiz",
      buttonColor: "bg-cyan-600 hover:bg-cyan-700",
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-100",
      link: "/quiz"
    },
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "TimeTable Scheduler",
      description: "Organize your study schedule, track assignments, and manage your academic calendar efficiently",
      buttonText: "Manage Schedule",
      buttonColor: "bg-cyan-600 hover:bg-cyan-700",
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-100",
      link: "/schedule"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-card"
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-4 text-text-primary"
          >
            Welcome to StudyBuddy
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-text-secondary max-w-3xl mx-auto mb-12"
          >
            Your comprehensive platform for VTU engineering studies. Access notes, generate quizzes, and manage your schedule all in one place.
          </motion.p>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`${feature.iconBg} ${feature.iconColor} w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">{feature.title}</h3>
                <p className="text-text-secondary text-sm mb-6 leading-relaxed min-h-[80px]">
                  {feature.description}
                </p>
                <Link 
                  to={feature.link}
                  className={`${feature.buttonColor} text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 inline-block w-full`}
                >
                  {feature.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Resources Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-card-hover rounded-2xl p-10 text-center shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-text-primary">Student Resources</h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Access all your study materials, create personalized quizzes, and stay organized with our scheduling tools.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;