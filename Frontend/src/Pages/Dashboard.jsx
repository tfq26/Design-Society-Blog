import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '../hooks/useDebounce';
import { Link } from 'react-router-dom';
import { getPosts } from '../Api/api';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---
// Component for the blog post dashboard
// ---
const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(posts.map(post => post.authorName))];
    return uniqueAuthors.filter(author => author);
  }, [posts]);

    const filteredPosts = posts.filter(post => {
    const searchMatch = debouncedSearchTerm
      ? (post.title && post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) || 
        (post.content && post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      : true;

    const authorMatch = selectedAuthor 
      ? post.authorName === selectedAuthor
      : true;

    return searchMatch && authorMatch;
  });

  if (loading) {
    return <div className="text-center py-10 font-medium" style={{ color: 'var(--eerie-black)' }}>Loading posts...</div>;
  }

  if (error) {
    return <div className="p-4 rounded-lg shadow-inner" style={{ backgroundColor: 'var(--beige)', color: 'var(--red)' }}>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-eerie-black dark:text-white mb-4">
            Blog Posts
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Explore our latest articles and updates
          </p>
          <div className="h-1 w-24 bg-orange-wheel rounded-full mx-auto mt-4"></div>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 bg-white dark:bg-ash-gray rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-orange-600 rounded-lg bg-white dark:bg-orange-100 text-gray-900 dark:text-orange-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-wheel focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2.5 border border-gray-300 dark:border-orange-600 rounded-lg bg-white dark:bg-orange-100 text-gray-900 dark:text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-wheel focus:border-transparent"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedAuthor) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAuthor('');
                }}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-orange-wheel transition-colors"
              >
                <X className="w-4 h-4 mr-1" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-wheel"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No posts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || selectedAuthor 
                ? "Try adjusting your search or filters."
                : "There are no posts available at the moment. Please check back later!"
              }
            </p>
            {(searchTerm || selectedAuthor) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAuthor('');
                }}
                className="px-4 py-2 text-sm font-medium text-orange-wheel hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              post && post.id && (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-ash-gray rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
                >
                  <Link to={`/post/${post.id}`} className="block h-full">
                    <div className="p-6">
                      <p className="text-sm text-gray-100 mb-2">
                        {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                      <h3 className="text-xl font-bold text-eerie-black dark:text-white mb-3 group-hover:text-orange-wheel transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-wheel">
                          By {post.authorName || 'Unknown Author'}
                        </span>
                        <span className="text-sm text-gray-100">
                          Read more →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
