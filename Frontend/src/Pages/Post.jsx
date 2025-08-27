import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost, getComments, addComment, updateComment, deleteComment } from '../Api/api';
import { useAuth } from '../hooks/useAuth';
import Comment from '../Components/Comment';

// ---
// Component for viewing a single post
// ---
const Post = () => {
  // Using 'id' to match the route parameter in App.jsx
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
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

    try {
      await addComment(postId, newComment);
      setNewComment('');
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

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(postId, commentId);
      } catch (err) {
        setError(err.message || 'Failed to delete comment.');
      }
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleReply = async (commentId, content) => {
    try {
      await addComment(postId, content, commentId);
    } catch (err) {
      setError(err.message || 'Failed to post reply.');
    }
  };

  const nestComments = (commentList) => {
    const commentMap = {};

    commentList.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    const nestedComments = [];
    commentList.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      } else {
        nestedComments.push(commentMap[comment.id]);
      }
    });

    return nestedComments;
  };

  const threadedComments = nestComments(comments);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading post...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  if (!post) {
    return null; // Or a 'Post not found' component
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md dark:bg-zinc-800">
      {/* Navigation */}
      <button
        onClick={() => navigate('/')} // Go back to the blog page
        className="mb-4 text-blue-600 hover:underline dark:text-black dark:text-white"
      >
        ← Back
      </button>

      {/* Post Header */}
      <h1 className="text-3xl font-bold mb-2 dark:text-black dark:text-white">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-6 dark:text-black dark:text-white">
        By {post.authorName} · {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
      </p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-6 space-y-4">
          {post.images.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Post image ${index + 1}`}
              className="w-full rounded-xl shadow-sm"
            />
          ))}
        </div>
      )}

      {/* Post Content - Markdown Renderer */}
      <div className="prose max-w-none mb-8  dark:text-black dark:text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Discussion Section */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Discussion ({comments.length})</h2>

        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              className="w-full p-2 border rounded-lg dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
              rows="3"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          </form>
        ) : (
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to join the discussion.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {threadedComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              replies={comment.replies}
              onReply={handleReply}
              onEdit={startEditing}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>

        {editingCommentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit Comment</h3>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-zinc-700 dark:text-white dark:border-zinc-600"
                rows="4"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => setEditingCommentId(null)} className="px-4 py-2 bg-gray-200 text-black rounded-lg dark:bg-zinc-600 dark:text-white">Cancel</button>
                <button onClick={() => handleUpdateComment(editingCommentId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
