import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiChevronDown, FiUser, FiLogOut, FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const NavBar = () => {
  const { currentUser, logout, sendEmailVerification } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
      console.error(error);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-zinc-800 p-4 shadow-md rounded-b-lg sticky top-0 z-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Aries</h1>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="flex space-x-2">
            <Link 
              to="/" 
              className="py-2 px-4 cursor-pointer rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Blog
            </Link>
            {currentUser && (
              <Link 
                to="/create" 
                className="py-2 px-4 cursor-pointer rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Create Post
              </Link>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                  aria-label="User menu"
                >
                  <div className="relative">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium border-2 border-transparent group-hover:border-blue-300 transition-colors">
                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 
                         currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    {!currentUser.emailVerified && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-800 flex items-center justify-center">
                        <FiAlertCircle className="text-white text-xs" />
                      </span>
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </p>
                    <div className="flex items-center">
                      {currentUser.emailVerified ? (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                          <FiCheckCircle className="mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                          <FiAlertCircle className="mr-1" /> Verify Email
                        </span>
                      )}
                    </div>
                  </div>
                  <FiChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-700 rounded-md shadow-lg py-1 z-50 divide-y divide-gray-100 dark:divide-zinc-600">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.email}
                      </p>
                      {!currentUser.emailVerified && (
                        <div className="mt-2">
                          <button
                            onClick={async () => {
                              try {
                                await sendEmailVerification(currentUser);
                                setError('');
                                alert('Verification email sent. Please check your inbox.');
                              } catch (error) {
                                console.error('Error sending verification email:', error);
                                setError('Failed to send verification email');
                              }
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-600 rounded"
                          >
                            Verify Email
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUser className="mr-2" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-600 text-left"
                      >
                        <FiLogOut className="mr-2" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="py-2 px-4 cursor-pointer rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="py-2 px-4 cursor-pointer rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
