import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Calendar, Shield, Activity, Terminal, Lock, Cpu, Wifi, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setLoadingEvents(false);
        return;
      }
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(3);

        if (data) {
          setUpcomingEvents(data);
        }
      } catch (error) {
        console.error('Error fetching events', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user, supabase]);

  const getEventColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'exam': return 'red';
      case 'assignment': return 'yellow';
      case 'class': return 'blue';
      default: return 'green';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
      icon: <BookOpen className="w-8 h-8" />,
      title: "Notes",
      subtitle: "Study Materials",
      description: "Access comprehensive notes for all VTU engineering courses organized by department and semester",
      buttonText: "Browse Notes",
      accentColor: "cyan",
      link: "/departments"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Quiz Generator",
      subtitle: "Test Knowledge",
      description: "Generate custom quizzes based on your course materials to test your knowledge and prepare for exams",
      buttonText: "Create Quiz",
      accentColor: "green",
      link: "/quiz"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "TimeTable Scheduler",
      subtitle: "Manage Time",
      description: "Organize your study schedule, track assignments, and manage your academic calendar efficiently",
      buttonText: "Manage Schedule",
      accentColor: "purple",
      link: "/schedule"
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

      <div className="relative z-10">
        <Navbar />
        
        {/* Header Section */}
        <motion.section 
          className="pt-36 pb-12 px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-500/30 pb-6 mb-12">
              <div>
                <motion.div variants={itemVariants} className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs tracking-[0.2em]">SECURE CONNECTION ESTABLISHED</span>
                </motion.div>
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase glitch-text"
                  style={{ textShadow: '0 0 10px rgba(6,182,212,0.5)' }}
                >
                  Welcome to StudyBuddy
                </motion.h1>
                <motion.p 
                  variants={itemVariants}
                  className="text-lg text-slate-400 max-w-3xl mt-4"
                >
                  Your comprehensive platform for VTU engineering studies. Access notes, generate quizzes, and manage your schedule all in one place.
                </motion.p>
              </div>
              <motion.div variants={itemVariants} className="flex items-center gap-4 mt-4 md:mt-0 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>SYSTEM ONLINE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  <span>LATENCY: 12ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>CPU: OPTIMAL</span>
                </div>
              </motion.div>
            </div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: "ACTIVE STUDENTS", value: "1,248", icon: <Activity className="w-4 h-4 text-green-400" /> },
                { label: "TOTAL RESOURCES", value: "8,502", icon: <Terminal className="w-4 h-4 text-cyan-400" /> },
                { label: "DEPARTMENTS", value: "8", icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
                { label: "DAILY DOWNLOADS", value: "450+", icon: <Cpu className="w-4 h-4 text-blue-400" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-sm backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-500 tracking-widest">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-200 font-mono">{stat.value}</div>
                </div>
              ))}
            </motion.div>
            
            {/* Main Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden rounded-sm flex flex-col"
                >
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Animated Scanline */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                  <div className="p-8 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-sm flex items-center justify-center bg-slate-950 border border-${feature.accentColor}-500/30 group-hover:border-${feature.accentColor}-500 group-hover:shadow-[0_0_15px_rgba(var(--${feature.accentColor}-rgb),0.3)] transition-all duration-300`}>
                        <div className={`text-${feature.accentColor}-400 group-hover:scale-110 transition-transform duration-300`}>
                          {feature.icon}
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 bg-${feature.accentColor}-500/10 text-${feature.accentColor}-400 border border-${feature.accentColor}-500/20 rounded-sm uppercase tracking-wider`}>
                        Module_0{index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 tracking-wide group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                    <div className={`text-xs text-${feature.accentColor}-400 mb-4 tracking-widest uppercase flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full bg-${feature.accentColor}-500 animate-pulse`}></span>
                      {feature.subtitle}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed border-l-2 border-slate-800 pl-4 group-hover:border-cyan-500/30 transition-colors flex-grow">
                      {feature.description}
                    </p>
                    
                    <Link 
                      to={feature.link}
                      className={`relative overflow-hidden inline-flex items-center justify-center w-full py-3 px-4 bg-slate-950 border border-slate-700 hover:border-${feature.accentColor}-500 text-slate-300 hover:text-${feature.accentColor}-400 text-sm font-bold tracking-widest uppercase transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    >
                      <span className="relative z-10 flex items-center">
                        {feature.buttonText}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className={`absolute inset-0 bg-${feature.accentColor}-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300`}></div>
                    </Link>
                  </div>
                  
                  {/* Background Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${feature.accentColor}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                </motion.div>
              ))}
            </div>

            {/* Upcoming Events Section */}
            <motion.div 
              variants={itemVariants}
              className="mb-16"
            >
              <div className="flex justify-between items-end mb-6 border-b border-slate-800 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-cyan-500" />
                    Upcoming Events
                  </h2>
                  <p className="text-slate-500 text-xs mt-1 tracking-wider">SCHEDULED PROTOCOLS & ASSIGNMENTS</p>
                </div>
                <Link to="/schedule" className="text-cyan-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                  View Full Schedule <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loadingEvents ? (
                  <div className="col-span-3 text-center py-8 text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">LOADING SCHEDULE DATA...</div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="col-span-3 text-center py-8 border border-slate-800 border-dashed rounded-sm">
                    <p className="text-slate-500 uppercase tracking-widest text-xs">No upcoming events found</p>
                    <Link to="/schedule" className="text-cyan-500 text-xs mt-2 inline-block hover:underline uppercase tracking-wider">ADD EVENT</Link>
                  </div>
                ) : (
                  upcomingEvents.map((event, i) => {
                    const color = getEventColor(event.event_type);
                    const dateStr = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
                    const timeStr = event.event_time ? event.event_time.substring(0, 5) + ' HRS' : 'ALL DAY';
                    
                    return (
                      <Link to="/schedule" key={i} className="group block">
                        <div className={`bg-slate-900/50 border border-slate-800 hover:border-${color}-500/50 p-5 rounded-sm transition-all duration-300 hover:bg-slate-900 hover:translate-y-[-2px] relative overflow-hidden`}>
                          <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`}></div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-1 bg-${color}-500/10 text-${color}-400 rounded-sm uppercase`}>
                              {event.event_type || 'EVENT'}
                            </span>
                            <span className="text-slate-500 text-xs font-mono">{dateStr}</span>
                          </div>
                          <h4 className="text-white font-bold mb-2 group-hover:text-cyan-400 transition-colors truncate">{event.title}</h4>
                          <div className="flex items-center text-slate-500 text-xs font-mono">
                            <Clock className="w-3 h-3 mr-2" />
                            {timeStr}
                          </div>
                          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4 text-cyan-500 -rotate-45" />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>


      </div>
    </div>
  );
};

export default Dashboard;