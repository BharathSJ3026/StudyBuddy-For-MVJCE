import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Book, GraduationCap, Users, Calendar, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Pause for 3 seconds at the end, then restart
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 3000);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: "Study Resources",
      description: "Curated lecture notes and comprehensive guides organized by department."
    },
    {
      icon: <Users className="w-6 h-6 text-rose-400" />,
      title: "Community Forums",
      description: "Connect with peers, discuss topics, and solve academic challenges together."
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      title: "Smart Schedule",
      description: "Automated planning for your classes, exams, and study sessions."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-amber-400" />,
      title: "Exam Prep",
      description: "Access a vast library of previous year question papers and solutions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* --- Background Video --- */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7) contrast(1.1)' }}
        >
          <source src="/dithered-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/40 to-[#030712]/80 pointer-events-none" />
        {/* Grain Texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* --- Navbar Spacer (Optional if you have a fixed nav) --- */}
      <div className="h-16"></div>

      {/* --- Hero Section --- */}
      <motion.section 
        className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Exclusively for MVJCE Students</span>
          </span>
        </motion.div>

        {/* Main Heading with Gradient Grey */}
        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-4xl"
        >
          <span className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-sm">
            Master Your
          </span>
          <br />
          <span className="bg-gradient-to-b from-slate-100 via-slate-300 to-slate-600 bg-clip-text text-transparent">
            Engineering Journey
          </span>
        </motion.h1>
        
        {/* Subtext */}
        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          StudyBuddy is the all-in-one academic ecosystem designed to help you organize, collaborate, and excel at <span className="text-slate-200 font-medium">MVJ College of Engineering</span>.
        </motion.p>
        
        {/* Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
          {user ? (
            <Link 
              to="/dashboard" 
              className="group relative inline-flex items-center gap-2 bg-slate-100 text-slate-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-white transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02]"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="group relative inline-flex items-center gap-2 bg-slate-100 text-slate-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-white transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </motion.section>

      {/* --- Features Grid --- */}
      <section className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-300 flex flex-col h-full"
            >
              <div className="mb-4 p-3 rounded-xl bg-white/[0.05] w-fit group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* --- Bottom CTA --- */}
      <section className="relative z-10 py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            Ready to elevate your grades?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of MVJCE students utilizing StudyBuddy to streamline their academic workflow.
          </p>
          {!user && (
             <Link 
             to="/register" 
             className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25"
           >
             Create Free Account
           </Link>
          )}
        </div>
      </section>

      {/* --- Minimal Footer --- */}
      <footer className="relative z-10 py-8 border-t border-white/[0.05] bg-[#020610]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Book className="h-5 w-5" />
            <span className="font-bold tracking-tight">StudyBuddy</span>
          </div>
          <div className="text-slate-600 text-xs font-mono">
            © {new Date().getFullYear()} StudyBuddy • MVJCE
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;