import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, BookOpen, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  items?: SidebarItem[];
}

const defaultItems: SidebarItem[] = [
  {
    title: 'Departments',
    icon: <GraduationCap className="w-5 h-5" />,
    path: '/departments',
  },
  {
    title: 'Resources',
    icon: <BookOpen className="w-5 h-5" />,
    path: '/departments',
  },
  {
    title: 'Schedule',
    icon: <Calendar className="w-5 h-5" />,
    path: '/schedule',
  },
  {
    title: 'Discussions',
    icon: <Users className="w-5 h-5" />,
    path: '/discussions',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ items = defaultItems }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="bg-slate-950/50 border-r border-slate-800 h-full p-4 pt-24 w-64 relative overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
      
      <nav className="mt-4 space-y-2">
        {items.map((item, index) => (
          <Link key={index} to={item.path}>
            <motion.div
              className={`flex items-center p-3 rounded-sm mb-2 transition-all duration-200 border-l-2 ${
                isActive(item.path) 
                  ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border-transparent hover:border-cyan-500/50'
              }`}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`mr-3 ${isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                {item.icon}
              </div>
              <span className="font-mono text-sm tracking-wide uppercase">{item.title}</span>
            </motion.div>
          </Link>
        ))}
      </nav>
      
      {/* Bottom status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-sm">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
            <span>STATUS</span>
            <span className="text-green-500">ONLINE</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;