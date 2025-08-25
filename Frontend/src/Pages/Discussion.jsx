import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getComments, addComment, getPost, updateComment, deleteComment } from '../Api/api';
import { useAuth } from '../contexts/AuthContext';

// ---
// Component for the discussion/comments section of a post
// ---
const Discussion = () => {
  const { id: postId } = useParams(); // Changed from postId to id to match route param
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  
  console.log('[Discussion] Component mounted with postId:', postId);

    useEffect(() => {
    console.log('[Discussion] useEffect triggered with postId:', postId);
    
    if (!postId) {
      const errorMsg = 'Post ID is missing in URL';
      console.error('[Discussion] Error:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        console.log('[Discussion] Fetching post with ID:', postId);
        const fetchedPost = await getPost(postId);
        console.log('[Discussion] Fetched post:', fetchedPost ? 'Success' : 'Not found');
        
        if (fetchedPost) {
          setPost(fetchedPost);
          
          // Setup real-time comments
          const unsubscribe = getComments(
            postId,
            (fetchedComments) => {
              setComments(fetchedComments);
              setLoading(false);
            },
            (err) => {
              console.error('Error fetching comments:', err);
              setError('Failed to load comments.');
              setLoading(false);
            }
          );
          
          return unsubscribe;
        } else {
          setError('Post not found.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in Discussion:', err);
        setError('Failed to load post details.');
        setLoading(false);
      }
    };

    const unsubscribe = fetchPostAndComments();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [postId]);

    const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(postId, newComment);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editedContent.trim()) return;
    try {
      await updateComment(postId, commentId, editedContent);
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(postId, commentId);
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-gray-500 dark:text-gray-400">Loading discussions...</div>
        {postId && <div className="text-sm text-gray-400">Post ID: {postId}</div>}
      </div>
    );
  }

  if (!post) {
    return <div className="text-center p-8">No post selected.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md dark:bg-zinc-800">
            <Link to={`/post/${postId}`} className="mb-4 text-blue-600 hover:underline dark:text-black dark:text-white">← Back to Post</Link>
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Discussion for: {post.title}</h1>
      
      {/* New Comment Form */}
      <form onSubmit={handleAddComment} className="mt-6 mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-lg"
          placeholder="Join the discussion..."
          rows="3"
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 dark:text-black dark:text-white">Post Comment</button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && <p>Loading comments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && comments.length === 0 && <p className="text-gray-500">No comments yet. Be the first!</p>}
        {comments.map(comment => (
          <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800">
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-lg"
                  rows="3"
                />
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleUpdateComment(comment.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 dark:text-white">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-2 dark:text-white">
                  By {comment.authorName} on {new Date(comment.createdAt?.seconds * 1000).toLocaleDateString()}
                  {comment.updatedAt && ` (edited on ${new Date(comment.updatedAt?.seconds * 1000).toLocaleDateString()})`}
                </p>
                {currentUser && currentUser.uid === comment.authorId && (
                  <div className="mt-2 space-x-2">
                    <button onClick={() => handleEditClick(comment)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discussion;
