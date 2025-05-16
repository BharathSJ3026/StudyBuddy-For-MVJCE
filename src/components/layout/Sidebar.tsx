import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, BookOpen, Calendar, Users, BookCopy } from 'lucide-react';
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
    path: '/resources',
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
  {
    title: 'Question Papers',
    icon: <BookCopy className="w-5 h-5" />,
    path: '/question-papers',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ items = defaultItems }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="bg-card h-full p-4 w-64">
      <nav className="mt-4 space-y-2">
        {items.map((item, index) => (
          <Link key={index} to={item.path}>
            <motion.div
              className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {item.icon}
              <span>{item.title}</span>
            </motion.div>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;