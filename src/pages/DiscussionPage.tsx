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
            className="max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary" />
                Discussion Forum
              </h1>
              
              <button
                onClick={() => setIsCreatingPost(!isCreatingPost)}
                className="button-primary flex items-center"
              >
                {isCreatingPost ? (
                  <>
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    New Post
                  </>
                )}
              </button>
            </div>

            {isCreatingPost && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-card rounded-lg shadow-md p-5"
              >
                <h2 className="text-lg font-medium mb-4">Create a New Post</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="post-title" className="block text-sm font-medium text-text-secondary mb-1">
                      Title
                    </label>
                    <input
                      id="post-title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter a descriptive title"
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="post-content" className="block text-sm font-medium text-text-secondary mb-1">
                      Content
                    </label>
                    <textarea
                      id="post-content"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What would you like to discuss?"
                      rows={4}
                      className="input-field w-full resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newTitle.trim() || !newPost.trim()}
                      className="button-primary flex items-center"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Post
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
                  className="bg-card rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-medium">{discussion.title}</h2>
                    <div className="flex items-center text-text-muted text-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(discussion.created_at)}
                    </div>
                  </div>
                  
                  <p className="text-text-secondary mb-4">{discussion.content}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-text-muted text-sm">
                      Posted by <span className="text-text-primary">{discussion.author}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-text-secondary hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span>{discussion.replies}</span>
                      </button>
                      
                      <button className="flex items-center text-text-secondary hover:text-primary transition-colors">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{discussion.likes}</span>
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
  );
};

export default DiscussionPage;