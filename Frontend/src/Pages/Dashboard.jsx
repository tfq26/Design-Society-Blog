import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../Api/api';

// ---
// Component for the blog post dashboard
// ---
const Dashboard = () => {
  const navigate = useNavigate();
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
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-lg shadow-sm transition bg-white text-black"
        />
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="w-full sm:w-64 p-3 rounded-lg shadow-sm transition bg-white text-black"
        >
          <option value="">All Authors</option>
          {authors.map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <p className="text-center py-10" style={{ color: 'var(--eerie-black)' }}>No posts found.</p>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            post && post.id && (
            <div 
              key={post.id} 
              className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl dark:bg-ash-gray bg-beige dark:text-white text-black"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <h2 className="text-xl font-semibold" style={{ color: 'var(--eerie-black)' }}>{post.title}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--eerie-black)', opacity: 0.8 }}>
                By {post.authorName} on {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </p>
              <p className="mt-4 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--eerie-black)' }}>
                {post.content.substring(0, 150)}...
              </p>
            </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
