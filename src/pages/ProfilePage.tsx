import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Clock, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useSupabase } from '../contexts/SupabaseContext';

interface UserProfile {
  username: string;
  email: string;
  department: string;
  semester: number;
  bio: string;
  joined_at: string;
}

interface Department {
  id: string;
  name: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const { user } = useAuth();
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [supabase]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            departments (
              name
            )
          `)
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            username: data.username || user.user_metadata?.username || 'Student',
            email: user.email || '',
            department: data.departments?.name || 'General',
            semester: data.semester || 1,
            bio: data.bio || '',
            joined_at: data.created_at
          });
        } else {
          setProfile({
            username: user.user_metadata?.username || 'Student',
            email: user.email || '',
            department: 'General',
            semester: 1,
            bio: '',
            joined_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase]);

  const handleEdit = () => {
    setEditedProfile({
      username: profile?.username,
      department: profile?.department,
      semester: profile?.semester,
      bio: profile?.bio
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      // Find department ID
      const selectedDept = departments.find(d => d.name === editedProfile.department);
      
      const updates = {
        username: editedProfile.username,
        department_id: selectedDept?.id,
        semester: editedProfile.semester,
        bio: editedProfile.bio,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates
        });

      if (error) throw error;

      setProfile(prev => prev ? ({ ...prev, ...editedProfile }) : null);
      setIsEditing(false);
      setEditedProfile({});
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen relative z-10">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

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
        <div className="flex h-screen">
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-56">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl mx-auto mt-24"
            >
              <motion.div variants={itemVariants} className="bg-slate-900/80 border border-slate-800 rounded-sm p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                
                <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-4">
                  <h1 className="text-2xl font-bold flex items-center text-white uppercase tracking-widest">
                    <User className="w-6 h-6 mr-2 text-cyan-500" />
                    USER_PROFILE_SETTINGS
                  </h1>
                  
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider text-xs transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      >
                        <Save className="w-3 h-3 mr-2" />
                        SAVE_CHANGES
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-950/30 font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider text-xs transition-all"
                      >
                        <X className="w-3 h-3 mr-2" />
                        ABORT
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="bg-transparent border border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30 font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider text-xs transition-all"
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      MODIFY_DATA
                    </button>
                  )}
                </div>
                
                {profile && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-24 h-24 bg-slate-950 border border-cyan-500/30 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)] relative group">
                        <div className="absolute inset-0 border border-cyan-500/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        <User className="w-10 h-10 text-cyan-500" />
                      </div>
                      
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="mb-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">USERNAME</label>
                            <input
                              type="text"
                              value={editedProfile.username || ''}
                              onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                              className="w-full bg-slate-950 border border-cyan-500/50 text-white text-xl font-bold px-3 py-2 rounded-sm focus:outline-none focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] font-mono"
                            />
                          </div>
                        ) : (
                          <h2 className="text-2xl font-bold mb-1 text-white tracking-wide">{profile.username}</h2>
                        )}
                        
                        <div className="flex items-center text-slate-400 text-sm mb-1 font-mono">
                          <Mail className="w-3 h-3 mr-2 text-cyan-600" />
                          {profile.email}
                        </div>
                        
                        <div className="flex items-center text-slate-500 text-xs font-mono uppercase">
                          <Clock className="w-3 h-3 mr-2" />
                          INITIATED: {formatDate(profile.joined_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                          DEPARTMENT_ASSIGNMENT
                        </label>
                        {isEditing ? (
                          <select
                            value={editedProfile.department || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, department: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-300 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.length > 0 ? (
                              departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                              ))
                            ) : (
                              <>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information Science">Information Science</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <div className="flex items-center bg-slate-950 border border-slate-800 px-4 py-3 rounded-sm text-slate-300">
                            <BookOpen className="w-4 h-4 mr-3 text-cyan-500" />
                            {profile.department}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                          CURRENT_SEMESTER
                        </label>
                        {isEditing ? (
                          <select
                            value={editedProfile.semester || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, semester: parseInt(e.target.value)})}
                            className="w-full bg-slate-950 border border-slate-700 text-slate-300 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <option key={sem} value={sem}>SEMESTER {sem}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-sm text-slate-300 font-mono">
                            SEMESTER {profile.semester}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        USER_BIO_DATA
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.bio || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                          rows={4}
                          className="w-full bg-slate-950 border border-slate-700 text-slate-300 px-3 py-2 rounded-sm focus:outline-none focus:border-cyan-500 font-mono text-sm resize-none"
                        />
                      ) : (
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-sm text-slate-400 text-sm leading-relaxed font-mono">
                          {profile.bio}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-slate-900/50 border border-slate-800 rounded-sm p-6">
                <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest flex items-center">
                  <span className="w-2 h-2 bg-red-500 mr-3 animate-pulse"></span>
                  DANGER_ZONE
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <button className="w-full bg-transparent border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 py-3 px-4 rounded-sm uppercase tracking-widest text-xs font-bold transition-all text-left flex justify-between items-center group">
                      <span>UPDATE_SECURITY_CREDENTIALS</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">_&gt;</span>
                    </button>
                  </div>
                  
                  <div>
                    <button className="w-full bg-transparent border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 py-3 px-4 rounded-sm uppercase tracking-widest text-xs font-bold transition-all text-left flex justify-between items-center group">
                      <span>NOTIFICATION_PROTOCOLS</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">_&gt;</span>
                    </button>
                  </div>
                  
                  <div>
                    <button className="w-full bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 hover:border-red-500 text-red-500 py-3 px-4 rounded-sm uppercase tracking-widest text-xs font-bold transition-all text-left flex justify-between items-center group">
                      <span>TERMINATE_ACCOUNT</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">_X</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;