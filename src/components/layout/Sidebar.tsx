import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Calendar, Users, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

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
    title: 'Research',
    icon: <GraduationCap className="w-5 h-5" />,
    path: '/research',
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
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Scholar';
  const email = user?.email || '';

  return (
    <aside className="bg-slate-950/50 border-r border-slate-800 h-full p-4 pt-24 w-64 relative overflow-hidden flex flex-col">
      {/* Decorative line */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"></div>
      
      <nav className="mt-4 space-y-2 flex-1">
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
      
      {/* User Profile Section */}
      <div className="mt-auto pt-4 border-t border-slate-800/50">
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-sm group hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-sm bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-200 truncate font-mono">{username}</div>
              <div className="text-[10px] text-slate-500 truncate font-mono">{email}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2">
            <span>STATUS</span>
            <span className="text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 text-xs font-mono border border-slate-700 hover:border-red-500/30 transition-all uppercase tracking-wider"
          >
            <LogOut className="w-3 h-3" />
            LOGOUT
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;