import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Send, ThumbsUp, ArrowUp, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  replies: number;
  likes: number;
}

const DiscussionPage: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        // Simulate data loading since Supabase isn't connected yet
        setTimeout(() => {
          // Mock discussions data
          setDiscussions([
            {
              id: '1',
              title: 'How to approach the DSA assignment?',
              content: 'I\'m struggling with the recent Data Structures assignment. Any tips on how to approach the binary tree traversal problem?',
              author: 'Rahul S',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              replies: 8,
              likes: 12
            },
            {
              id: '2',
              title: 'Study group for Database Systems',
              content: 'Looking for students interested in forming a study group for the upcoming Database Systems exam. We can meet in the library or online.',
              author: 'Priya K',
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              replies: 15,
              likes: 24
            },
            {
              id: '3',
              title: 'Resources for Machine Learning project',
              content: 'Does anyone have good resources or datasets for the Machine Learning project? I\'m planning to work on an image classification system.',
              author: 'Aditya M',
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              replies: 6,
              likes: 18
            },
            {
              id: '4',
              title: 'Internship opportunities in Bangalore',
              content: 'I\'m looking for summer internship opportunities in Bangalore. Anyone knows companies that are currently hiring for software development roles?',
              author: 'Sneha R',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              replies: 12,
              likes: 30
            },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [supabase]);

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newPost.trim()) return;
    
    // In a real implementation, this would be a Supabase call
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      title: newTitle,
      content: newPost,
      author: 'You',
      created_at: new Date().toISOString(),
      replies: 0,
      likes: 0
    };
    
    setDiscussions([newDiscussion, ...discussions]);
    setNewPost('');
    setNewTitle('');
    setIsCreatingPost(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
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
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
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
              className="max-w-4xl mx-auto mt-24"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center text-white uppercase tracking-widest">
                    <MessageSquare className="w-6 h-6 mr-2 text-cyan-500" />
                    DISCUSSION_FORUM
                  </h1>
                </div>
                
                <button
                  onClick={() => setIsCreatingPost(!isCreatingPost)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  {isCreatingPost ? (
                    <>
                      <ArrowUp className="w-4 h-4 mr-1" />
                      ABORT
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      INITIATE THREAD
                    </>
                  )}
                </button>
              </div>

              {isCreatingPost && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-slate-900/80 border border-cyan-500/30 rounded-sm shadow-lg p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                  <h2 className="text-sm font-bold mb-4 text-cyan-400 uppercase tracking-widest">New Transmission Protocol</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="post-title" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                        Subject Line
                      </label>
                      <input
                        id="post-title"
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="ENTER SUBJECT"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="post-content" className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                        Message Body
                      </label>
                      <textarea
                        id="post-content"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="ENTER MESSAGE CONTENT..."
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono resize-none placeholder-slate-700"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleCreatePost}
                        disabled={!newTitle.trim() || !newPost.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-sm flex items-center uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      >
                        <Send className="w-3 h-3 mr-2" />
                        TRANSMIT
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <motion.div
                    key={discussion.id}
                    variants={itemVariants}
                    className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-slate-800 group-hover:bg-cyan-500 transition-colors"></div>
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <h2 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{discussion.title}</h2>
                      <div className="flex items-center text-slate-500 text-xs font-mono">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(discussion.created_at).toUpperCase()}
                      </div>
                    </div>
                    
                    <p className="text-slate-400 mb-4 pl-2 text-sm leading-relaxed">{discussion.content}</p>
                    
                    <div className="flex justify-between items-center pl-2 border-t border-slate-800/50 pt-3 mt-2">
                      <div className="text-slate-600 text-xs font-mono uppercase">
                        ORIGIN: <span className="text-cyan-600">{discussion.author}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center text-slate-500 hover:text-cyan-400 transition-colors text-xs font-bold uppercase">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>{discussion.replies} REPLIES</span>
                        </button>
                        
                        <button className="flex items-center text-slate-500 hover:text-green-400 transition-colors text-xs font-bold uppercase">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          <span>{discussion.likes} ACKS</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DiscussionPage;