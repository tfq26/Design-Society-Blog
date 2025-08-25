import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../Api/api';

// ---
// Component for the blog post dashboard
// ---
const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch posts in real-time on component mount
  useEffect(() => {
    const unsubscribe = getPosts(
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false);
      },
      (err) => { // This is the error callback
        console.error("Error fetching posts:", err);
        setError("Failed to fetch posts.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

    const filteredPosts = posts.filter(post => {
    const titleMatch = post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const contentMatch = post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || contentMatch;
  });

  if (loading) {
    return <div className="text-center py-10 font-medium text-gray-600 dark: text-black">Loading posts...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-inner dark: text-black dark:bg-zinc-800">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-sm"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500 py-10 dark: text-black ">No posts found.</p>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            post && post.id && (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-600 dark:bg-zinc-800">
              <h2 className="text-xl font-semibold text-gray-800 dark: text-black dark:text-white">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-1 dark: text-black dark:text-white">
                By {post.authorName} on {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-gray-700 mt-4 overflow-hidden text-ellipsis whitespace-nowrap dark: text-black dark:text-white">{post.content.substring(0, 150)}...</p>
                            <div className="mt-4 flex space-x-4">
                <Link 
                  to={`/post/${post.id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium dark:text-black dark:text-white"
                >
                  Read More
                </Link>
                <Link 
                  to={`/post/${post.id}/discussion`}
                  className="text-purple-600 hover:text-purple-800 transition-colors font-medium dark:text-black dark:text-white"
                >
                  Start Discussion
                </Link>
              </div>
            </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
