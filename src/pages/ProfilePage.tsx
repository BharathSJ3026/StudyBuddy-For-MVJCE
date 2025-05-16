import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, BookOpen, Clock, Edit, Save, X } from 'lucide-react';
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

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        // Simulate data loading since Supabase isn't connected yet
        setTimeout(() => {
          // Mock profile data
          setProfile({
            username: user.user_metadata?.username || 'MVJCE Student',
            email: user.email || '',
            department: 'Computer Science',
            semester: 4,
            bio: 'Engineering student at MVJCE with interests in AI, web development, and algorithms.',
            joined_at: new Date(user.created_at || Date.now()).toISOString()
          });
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user profile:', error);
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
    if (!profile) return;
    
    // In a real implementation, this would be a Supabase call
    setProfile({
      ...profile,
      ...editedProfile
    });
    
    setIsEditing(false);
    setEditedProfile({});
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold flex items-center">
                  <User className="w-6 h-6 mr-2 text-primary" />
                  Profile Settings
                </h1>
                
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="button-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="button-outline flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="button-outline flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                  </button>
                )}
              </div>
              
              {profile && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-24 h-24 bg-card-hover rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-text-muted" />
                    </div>
                    
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.username || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                          className="input-field text-xl font-bold mb-1"
                        />
                      ) : (
                        <h2 className="text-xl font-bold mb-1">{profile.username}</h2>
                      )}
                      
                      <div className="flex items-center text-text-secondary">
                        <Mail className="w-4 h-4 mr-1" />
                        {profile.email}
                      </div>
                      
                      <div className="flex items-center text-text-secondary mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        Joined {formatDate(profile.joined_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Department
                      </label>
                      {isEditing ? (
                        <select
                          value={editedProfile.department || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, department: e.target.value})}
                          className="input-field w-full"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Science">Information Science</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-primary" />
                          {profile.department}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Semester
                      </label>
                      {isEditing ? (
                        <select
                          value={editedProfile.semester || ''}
                          onChange={(e) => setEditedProfile({...editedProfile, semester: parseInt(e.target.value)})}
                          className="input-field w-full"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      ) : (
                        <span>Semester {profile.semester}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                        rows={4}
                        className="input-field w-full resize-none"
                      />
                    ) : (
                      <p className="text-text-secondary">{profile.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <button className="button-outline w-full justify-center py-2">
                    Change Password
                  </button>
                </div>
                
                <div>
                  <button className="button-outline w-full justify-center py-2">
                    Notification Preferences
                  </button>
                </div>
                
                <div>
                  <button className="button-outline w-full justify-center py-2 border-error text-error hover:bg-error/10">
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;