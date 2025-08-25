import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost } from '../Api/api'; // Assuming getPost fetches a single post

// ---
// Component for viewing a single post
// ---
const Post = () => {
  // Using 'id' to match the route parameter in App.jsx
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('[Post] Component mounted with postId:', postId);

  useEffect(() => {
    console.log('[Post] useEffect triggered with postId:', postId);
    
    const fetchPost = async () => {
      console.log('[Post] Starting to fetch post with ID:', postId);
      try {
        const fetchedPost = await getPost(postId);
        console.log('[Post] Successfully fetched post:', fetchedPost);
        
        if (fetchedPost) {
          setPost(fetchedPost);
          console.log('[Post] Post state updated');
        } else {
          console.error('[Post] No post data returned for ID:', postId);
          setError('Post not found.');
        }
      } catch (err) {
        console.error('[Post] Error in fetchPost:', {
          error: err,
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        setError(err.message || 'Failed to fetch post.');
      } finally {
        console.log('[Post] Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    if (postId) {
      console.log('[Post] Post ID exists, starting fetch');
      fetchPost();
    } else {
      console.error('[Post] No postId found in URL');
      setLoading(false);
      setError('Post ID not found in the URL.');
    }
  }, [postId]);

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

      {/* Navigate to Discussion */}
      <Link
        to={`/post/${postId}/discussion`}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 dark:text-black dark:text-white"
      >
        View Discussions
      </Link>
    </div>
  );
};

export default Post;
