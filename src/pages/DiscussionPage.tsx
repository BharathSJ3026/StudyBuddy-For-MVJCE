import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Send, ThumbsUp, ArrowUp, Calendar, User, X, MessageCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  author_name?: string;
  parent_id: string | null;
  replies?: Comment[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  author_name?: string;
  replies_count?: number;
  likes?: number; // Keeping for UI compatibility, though not in DB schema
}

const DiscussionPage: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Comments state
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchDiscussions();
  }, [supabase]);

  useEffect(() => {
    if (expandedDiscussionId) {
      fetchComments(expandedDiscussionId);
    } else {
      setComments([]);
      setReplyingTo(null);
    }
  }, [expandedDiscussionId]);

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;

      if (!discussionsData) {
        setDiscussions([]);
        return;
      }

      // Fetch profiles for authors
      const userIds = [...new Set(discussionsData.map(d => d.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
        
      if (profilesError) console.error('Error fetching profiles:', profilesError);

      // Fetch comment counts
      const { data: commentsData } = await supabase
        .from('comments')
        .select('discussion_id');
        
      const commentCounts: Record<string, number> = {};
      commentsData?.forEach((c: any) => {
        commentCounts[c.discussion_id] = (commentCounts[c.discussion_id] || 0) + 1;
      });

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]));

      const formattedDiscussions: Discussion[] = discussionsData.map(d => ({
        ...d,
        author_name: profilesMap.get(d.user_id) || 'Unknown User',
        replies_count: commentCounts[d.id] || 0,
        likes: 0 // Default to 0 as per schema limitations
      }));

      setDiscussions(formattedDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (discussionId: string) => {
    try {
      setIsLoadingComments(true);
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (commentsData) {
        // Fetch profiles for comment authors
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]));

        const formattedComments: Comment[] = commentsData.map(c => ({
          ...c,
          author_name: profilesMap.get(c.user_id) || 'Unknown User',
          replies: []
        }));

        // Build comment tree
        const commentMap: Record<string, Comment> = {};
        const roots: Comment[] = [];

        formattedComments.forEach(c => {
          commentMap[c.id] = c;
        });

        formattedComments.forEach(c => {
          if (c.parent_id && commentMap[c.parent_id]) {
            commentMap[c.parent_id].replies?.push(c);
          } else {
            roots.push(c);
          }
        });

        setComments(roots);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newPost.trim()) return;
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert({
          title: newTitle,
          content: newPost,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically add to list
      const newDiscussion: Discussion = {
        ...data,
        author_name: user.user_metadata?.username || 'You',
        replies_count: 0,
        likes: 0
      };
      
      setDiscussions([newDiscussion, ...discussions]);
      setNewPost('');
      setNewTitle('');
      setIsCreatingPost(false);
      toast.success('Discussion started successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleAddComment = async (parentId: string | null = null) => {
    if (!newComment.trim() || !expandedDiscussionId) return;
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const { data, error } = await supabase
        .from('comments')
        .insert({
          discussion_id: expandedDiscussionId,
          content: newComment,
          user_id: user.id,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      const newCommentObj: Comment = {
        ...data,
        author_name: user.user_metadata?.username || 'You',
        replies: []
      };

      // Refresh comments to rebuild tree correctly
      // Or optimistically update tree (complex)
      // For simplicity, let's re-fetch comments
      await fetchComments(expandedDiscussionId);

      setNewComment('');
      setReplyingTo(null);
      
      // Update reply count in discussions list
      setDiscussions(discussions.map(d => 
        d.id === expandedDiscussionId 
          ? { ...d, replies_count: (d.replies_count || 0) + 1 } 
          : d
      ));
      
      toast.success('Reply added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => (
    <div className={`mb-3 ${depth > 0 ? 'ml-4 md:ml-8 border-l border-slate-800 pl-4' : ''}`}>
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-sm hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-2">
          <span className="text-cyan-500 text-xs font-bold">{comment.author_name}</span>
          <span className="text-slate-600 text-[10px]">{formatDate(comment.created_at)}</span>
        </div>
        <p className="text-slate-300 text-sm mb-2">{comment.content}</p>
        
        <button 
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase font-bold flex items-center gap-1"
        >
          <MessageCircle className="w-3 h-3" />
          Reply
        </button>

        {replyingTo === comment.id && (
          <div className="mt-3 pl-2 border-l-2 border-cyan-500/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Reply to ${comment.author_name}...`}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-xs font-mono placeholder-slate-700"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(comment.id);
                  }
                }}
              />
              <button
                onClick={() => handleAddComment(comment.id)}
                disabled={!newComment.trim() || submittingComment}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 rounded-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingComment ? <LoadingSpinner size="small" /> : <Send className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

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
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-24 md:pt-24">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto mt-8"
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

              <AnimatePresence>
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
              </AnimatePresence>

              <div className="space-y-4 pb-20">
                {discussions.length === 0 ? (
                  <div className="text-center py-12 border border-slate-800 border-dashed rounded-sm">
                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 uppercase tracking-widest">No transmissions found</p>
                    <p className="text-slate-600 text-xs mt-2">Be the first to initiate a thread</p>
                  </div>
                ) : (
                  discussions.map((discussion) => (
                    <motion.div
                      key={discussion.id}
                      variants={itemVariants}
                      className={`bg-slate-900/50 border ${expandedDiscussionId === discussion.id ? 'border-cyan-500/50' : 'border-slate-800'} rounded-sm transition-all group relative overflow-hidden`}
                    >
                      <div className={`absolute top-0 left-0 w-0.5 h-full ${expandedDiscussionId === discussion.id ? 'bg-cyan-500' : 'bg-slate-800 group-hover:bg-cyan-500'} transition-colors`}></div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <h2 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{discussion.title}</h2>
                          <div className="flex items-center text-slate-500 text-xs font-mono">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(discussion.created_at).toUpperCase()}
                          </div>
                        </div>
                        
                        <p className="text-slate-400 mb-4 pl-2 text-sm leading-relaxed">{discussion.content}</p>
                        
                        <div className="flex justify-between items-center pl-2 border-t border-slate-800/50 pt-3 mt-2">
                          <div className="text-slate-600 text-xs font-mono uppercase flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            ORIGIN: <span className="text-cyan-600 ml-1">{discussion.author_name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => setExpandedDiscussionId(expandedDiscussionId === discussion.id ? null : discussion.id)}
                              className={`flex items-center ${expandedDiscussionId === discussion.id ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-400'} transition-colors text-xs font-bold uppercase`}
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              <span>{discussion.replies_count} REPLIES</span>
                            </button>
                            
                            {/* Likes functionality removed as per schema */}
                            {/* <button className="flex items-center text-slate-500 hover:text-green-400 transition-colors text-xs font-bold uppercase">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              <span>{discussion.likes} ACKS</span>
                            </button> */}
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedDiscussionId === discussion.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950/50 border-t border-slate-800"
                          >
                            <div className="p-5 pl-7">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <MessageCircle className="w-3 h-3 mr-2" />
                                Transmission Log
                              </h3>
                              
                              {isLoadingComments ? (
                                <div className="flex justify-center py-4">
                                  <LoadingSpinner size="small" />
                                </div>
                              ) : comments.length === 0 ? (
                                <p className="text-slate-600 text-xs italic mb-4">No replies yet. Be the first to respond.</p>
                              ) : (
                                <div className="space-y-4 mb-6">
                                  {comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                  ))}
                                </div>
                              )}

                              {/* Add Comment Form (Main) */}
                              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                                <input
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Type your reply..."
                                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-sm focus:outline-none focus:border-cyan-500 text-slate-300 text-sm font-mono placeholder-slate-700"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment();
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleAddComment()}
                                  disabled={!newComment.trim() || submittingComment}
                                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {submittingComment ? (
                                    <LoadingSpinner size="small" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DiscussionPage;