import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost, getComments, addComment, updateComment, deleteComment } from '../Api/api';
import { useAuth } from '../hooks/useAuth';
import {motion, AnimatePresence} from 'framer-motion';
import Comment from '../Components/Comment';
import { ArrowLeft, MessageCircle, Edit, Trash2, X, Send, Calendar, User, Clock, AlertCircle } from 'lucide-react';

// ---
// Component for viewing a single post
// ---
const Post = () => {
  // Using 'id' to match the route parameter in App.jsx
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isVerified } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const commentInputRef = useRef(null);
  
  console.log('[Post] Component mounted with postId:', postId);

  useEffect(() => {
    if (!postId) {
      setError('Post ID not found in the URL.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPostAndComments = async () => {
      try {
        const fetchedPost = await getPost(postId);
        if (isMounted) {
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError('Post not found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch post.');
        }
      }
    };

    fetchPostAndComments();

    const unsubscribe = getComments(
      postId,
      (fetchedComments) => {
        if (isMounted) {
          setComments(fetchedComments);
          setLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load comments.');
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    if (!isVerified()) {
      setError('Please verify your email before commenting.');
      return;
    }

    try {
      await addComment(postId, newComment);
      setNewComment('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add comment.');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editedContent.trim()) return;

    try {
      await updateComment(postId, commentId, editedContent);
      setEditingCommentId(null);
      setEditedContent('');
    } catch (err) {
      setError(err.message || 'Failed to update comment.');
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (commentId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(commentId);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete comment.');
      setShowDeleteConfirm(null);
    }
  };

  const canDeleteComment = useCallback((comment) => {
    if (!currentUser) return false;
    // Admins can delete any comment
    if (isAdmin()) return true;
    // Users can delete their own comments if they're verified
    return comment.authorId === currentUser.uid && isVerified();
  }, [currentUser, isAdmin, isVerified]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-wheel"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-eerie-black dark:text-white mb-3">Post not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">The post you're looking for doesn't exist or may have been removed.</p>
            <Link
              to="/"
              className="inline-flex items-center px-5 py-2.5 bg-orange-wheel text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-wheel focus:ring-offset-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-orange-wheel hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to posts
        </button>

        <article className="mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-eerie-black dark:text-white mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1.5 text-orange-wheel" />
              <Link 
                to={`/user/${post.authorId}`}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {post.authorName || 'Unknown Author'}
              </Link>
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-orange-wheel" />
              {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </span>
            {post.updatedAt && post.updatedAt.seconds !== post.createdAt?.seconds && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-orange-wheel" />
                Updated {new Date(post.updatedAt.seconds * 1000).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none prose-headings:text-eerie-black dark:prose-headings:text-white prose-a:text-orange-wheel hover:prose-a:text-orange-700 dark:prose-a:text-orange-400 dark:hover:prose-a:text-orange-300 prose-strong:text-eerie-black dark:prose-strong:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-8">
            <MessageCircle className="w-6 h-6 text-orange-wheel mr-2" />
            <h2 className="text-2xl font-bold text-eerie-black dark:text-white">
              Comments ({comments.length})
            </h2>
          </div>

          {currentUser ? (
            <form onSubmit={handleSubmitComment} className="mb-12">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-medium ${currentUser.photoURL ? 'hidden' : 'flex'}`}>
                    {currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-wheel focus:border-transparent bg-white dark:bg-ash-gray text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-100 pr-12"
                      rows={3}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-3 bottom-3 p-1.5 text-orange-wheel hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Post comment"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-12 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Please <Link to="/login" className="text-orange-wheel hover:underline font-medium">sign in</Link> to leave a comment.
              </p>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No comments yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white dark:bg-ash-gray rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {comment.authorPhotoURL ? (
                        <img 
                          src={comment.authorPhotoURL} 
                          alt={comment.authorName || 'User'} 
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-medium ${comment.authorPhotoURL ? 'hidden' : 'flex'}`}>
                        {comment.authorName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-eerie-black dark:text-white">
                            <Link 
                              to={`/user/${comment.authorId}`}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              {comment.authorName || 'Anonymous'}
                            </Link>
                          </h4>
                          <p className="text-xs text-gray-100">
                            {comment.createdAt?.toDate ? 
                              new Date(comment.createdAt.toDate()).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              'Unknown date'}
                            {comment.updatedAt?.toDate && 
                              comment.updatedAt.seconds !== comment.createdAt?.toDate().getTime() / 1000 && (
                                <span className="ml-2 text-xs text-orange-700">(edited)</span>
                              )}
                          </p>
                        </div>
                        {currentUser?.uid === comment.authorId && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditedContent(comment.content);
                              }}
                              className="text-gray-100 hover:text-orange-wheel dark:hover:text-orange-400 transition-colors p-1"
                              title="Edit comment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canDeleteComment(comment) && (
                              <div className="relative">
                                <button
                                  onClick={(e) => handleDeleteClick(comment.id, e)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                  title="Delete comment"
                                >
                                  <Trash2 size={18} />
                                </button>
                                
                                {showDeleteConfirm === comment.id && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                    <div className="px-4 py-2 text-sm text-gray-700">
                                      <p className="mb-2">Delete this comment?</p>
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(null);
                                          }}
                                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(comment.id);
                                          }}
                                          className="px-2 py-1 text-xs bg-red-500 text-white hover:bg-red-600 rounded"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {editingCommentId === comment.id && (
                          <div className="mt-2 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditedContent('');
                              }}
                              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                            >
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </button>
                            <button
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditedContent('');
                            }}
                            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center"
                          >
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={!editedContent.trim()}
                            className="px-3 py-1.5 text-sm bg-orange-wheel text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4 mr-1" /> Update
                          </button>
                        </div>
                      ) : (
                        <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Post;
