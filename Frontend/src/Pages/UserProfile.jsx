import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../Api/api';
import { format } from 'date-fns';
import { FiArrowLeft, FiUser, FiCalendar, FiMail, FiFileText, FiGlobe } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userDoc.data();
        setUser({
          id: userDoc.id,
          ...userData,
          createdAt: userData.createdAt && typeof userData.createdAt.toDate === 'function' 
            ? userData.createdAt.toDate() 
            : userData.createdAt || new Date()
        });

        // Fetch user's posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = [];
        
        postsSnapshot.forEach((doc) => {
          const data = doc.data();
          userPosts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          });
        });
        
        setPosts(userPosts);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-eerie-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beige"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-eerie-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-eerie-black/80 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center border border-ash-gray/20">
          <div className="text-red text-4xl mb-4">
            <FiUser className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">User Not Found</h2>
          <p className="text-ash-gray/80 mb-6">The user you're looking for doesn't exist or may have been deleted.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-ash-gray/20 text-white rounded-md hover:bg-ash-gray/30 transition-colors border border-ash-gray/30"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eerie-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-eerie-black/80 backdrop-blur-sm rounded-xl overflow-hidden mb-8 border border-ash-gray/20 shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-ash-gray/10 h-32 md:h-40 relative">
            <div className="absolute -bottom-16 left-6">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <FiUser size={48} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-20 px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                <p className="text-ash-gray">@{user.username || user.displayName?.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              <div className="mt-4 md:mt-0">
                {user.website && (
                  <a 
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-beige hover:text-white transition-colors"
                  >
                    <FiGlobe className="mr-1" /> {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
            
            {user.bio && (
              <p className="mt-4 text-ash-gray">{user.bio}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-ash-gray/80">
              {user.email && (
                <div className="flex items-center">
                  <FiMail className="mr-1.5" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.createdAt && (
                <div className="flex items-center">
                  <FiCalendar className="mr-1.5" />
                  <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
          </div>
          
          <AnimatePresence>
            <motion.div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {posts.length === 0 ? (
                <motion.div 
                  className="col-span-full text-center py-12 text-ash-gray"
                  variants={fadeIn}
                >
                  <p>No posts yet.</p>
                </motion.div>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={fadeIn}
                    className="bg-eerie-black/80 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-ash-gray/10 hover:border-ash-gray/30"
                  >
                    <Link to={`/post/${post.id}`} className="block h-full hover:bg-ash-gray/5 transition-colors">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-beige transition-colors">{post.title}</h3>
                        <p className="text-ash-gray/80 text-sm mb-4 line-clamp-3">{post.content}</p>
                        <div className="flex items-center text-sm text-ash-gray/60">
                          <FiCalendar className="mr-1.5 text-beige" />
                          <span>{post.createdAt ? format(new Date(post.createdAt), 'MMMM d, yyyy') : 'No date'}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
