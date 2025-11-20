import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, Shield, Home, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'HOME', icon: <Home className="w-4 h-4" /> },
    { path: '/discussions', label: 'DISCUSSIONS', icon: <MessageSquare className="w-4 h-4" /> },
    { path: '/schedule', label: 'SCHEDULE', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-full px-2 py-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-between relative overflow-hidden"
        >
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.1),transparent)] translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300 ml-1">
            <Shield className="w-5 h-5" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className={`relative px-5 py-2 rounded-full text-xs font-bold font-mono transition-all duration-300 flex items-center gap-2 ${
                  isActive(item.path) 
                    ? 'text-slate-950' 
                    : 'text-slate-400 hover:text-cyan-400'
                }`}>
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-cyan-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle & Profile */}
          <div className="flex items-center gap-2 mr-1">
            {user ? (
              <Link to="/profile" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-all overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-full bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all">
                LOGIN
              </Link>
            )}

            <button 
              className="md:hidden w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isActive(item.path) 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-400'
                    }`}
                  >
                    {item.icon}
                    <span className="font-mono font-bold text-sm">{item.label}</span>
                  </Link>
                ))}
                {user && (
                  <button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                    className="p-3 rounded-xl flex items-center gap-3 text-red-400 hover:bg-red-900/20 transition-all mt-2 border border-transparent hover:border-red-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-mono font-bold text-sm">LOGOUT</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navbar;