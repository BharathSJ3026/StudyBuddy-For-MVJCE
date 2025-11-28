import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DitherWave from '../components/ui/DitherWave';
import TechButton from '../components/ui/TechButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      // Handle specific Supabase error cases
      if (error.message.includes('invalid_credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('email_not_confirmed')) {
        setError(
          'Please verify your email address before logging in. Check your inbox for a confirmation email.'
        );
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 font-mono relative overflow-hidden selection:bg-cyan-500/30 p-4">
      {/* Dither Wave Background */}
      <DitherWave color="#06b6d4" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="border border-cyan-500/50 bg-slate-900/80 p-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500"></div>
              <Book className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-1 text-white uppercase tracking-widest glitch-text" data-text="Welcome To Study Buddy!">Welcome To Study Buddy!</h1>
          <p className="text-cyan-500/80 text-center uppercase tracking-wider text-sm">Ready to gain knowledge!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/80 border border-slate-800 rounded-sm shadow-lg p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-sm text-sm font-mono">
              <span className="font-bold mr-2">[ERROR]:</span>
              {error}
              {error.includes('email_not_confirmed') && (
                <div className="mt-2">
                  <button
                    onClick={() => setError('')}
                    className="text-cyan-400 hover:underline font-medium uppercase text-xs"
                  >
                    Didn't receive the email? Contact support
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ENTER YOUR EMAIL ID"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="ENTER YOUR PASSWORD"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <TechButton
              type="submit"
              variant="neon-blue"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <LoadingSpinner size="small" className="mr-2" /> : null}
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </TechButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-wide">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 hover:underline">
                REGISTER HERE
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;