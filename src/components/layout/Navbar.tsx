import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const menuVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 }
  };

  return (
    <header className="bg-card/30 backdrop-blur-md shadow-md py-3 px-4 md:px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-6">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/discussions" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Discussions
            </Link>
            <Link 
              to="/schedule" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Schedule
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">

          {/* Profile Menu */}
          {user && (
            <div className="relative">
              <button 
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 hover:bg-card-hover rounded-full p-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-card-hover flex items-center justify-center">
                  <User className="w-5 h-5 text-text-primary" />
                </div>
              </button>

              {isProfileMenuOpen && (
                <motion.div 
                  initial="closed"
                  animate="open"
                  variants={menuVariants}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50"
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-text-secondary hover:bg-card-hover transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-text-secondary hover:bg-card-hover transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1 rounded-md hover:bg-card-hover transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.nav 
          initial="closed"
          animate="open"
          variants={menuVariants}
          transition={{ duration: 0.2 }}
          className="md:hidden mt-2 py-2"
        >
          <Link 
            to="/dashboard" 
            className="block py-2 px-4 text-text-secondary hover:bg-card-hover transition-colors"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link 
            to="/discussions" 
            className="block py-2 px-4 text-text-secondary hover:bg-card-hover transition-colors"
            onClick={toggleMenu}
          >
            Discussions
          </Link>
          <Link 
            to="/schedule" 
            className="block py-2 px-4 text-text-secondary hover:bg-card-hover transition-colors"
            onClick={toggleMenu}
          >
            Schedule
          </Link>
          <Link 
            to="/profile" 
            className="block py-2 px-4 text-text-secondary hover:bg-card-hover transition-colors"
            onClick={toggleMenu}
          >
            Profile Settings
          </Link>
          {user && (
            <button 
              onClick={() => {
                handleSignOut();
                toggleMenu();
              }}
              className="w-full text-left py-2 px-4 text-error hover:bg-card-hover transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </button>
          )}
        </motion.nav>
      )}
    </header>
  );
};

export default Navbar;