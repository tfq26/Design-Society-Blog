import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiChevronDown, FiUser, FiLogOut, FiMail, FiCheckCircle, FiAlertCircle, FiMenu, FiX } from 'react-icons/fi';

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

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const NavLinks = ({ isMobile }) => (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center space-x-2'}`}>
      <Link 
        to="/"
        className={`py-2 px-4 rounded-md transition-colors text-center ${isMobile ? 'w-full hover:bg-gray-100 dark:hover:bg-zinc-700' : 'w-28 bg-blue-500 text-white hover:bg-blue-600'}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        Blog
      </Link>
      {currentUser && (
        <Link 
          to="/create" 
          className={`py-2 px-4 rounded-md transition-colors text-center ${isMobile ? 'w-full hover:bg-gray-100 dark:hover:bg-zinc-700' : 'w-28 bg-green-500 text-white hover:bg-green-600'}`}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          Create Post
        </Link>
      )}
    </div>
  );

  const AuthButtons = ({ isMobile }) => (
    <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'flex-row items-center space-x-2'}`}>
      {currentUser ? (
        <div className={`${isMobile ? 'w-full' : ''} relative`} ref={menuRef}>
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className={`flex items-center ${isMobile ? 'justify-between w-full p-2' : ''} rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700`} aria-label="User menu">
            <div className="flex items-center space-x-2">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser.displayName || currentUser.email.split('@')[0]}</p>
                  <div className="flex items-center">
                    {currentUser.emailVerified ? (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center"><FiCheckCircle className="mr-1" /> Verified</span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center"><FiAlertCircle className="mr-1" /> Verify Email</span>
                    )}
                  </div>
                </div>
            </div>
            <FiChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>
          {isProfileMenuOpen && (
            <div className={`${isMobile ? 'relative mt-2' : 'absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-700 rounded-md shadow-lg py-1 z-50 divide-y divide-gray-100 dark:divide-zinc-600'}`}>
              {!isMobile && <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
              </div>}
              {!currentUser.emailVerified && (
                <div className={isMobile ? 'mt-2' : 'px-2'}>
                  <button onClick={async () => { try { await sendEmailVerification(currentUser); setError(''); alert('Verification email sent.'); } catch (error) { console.error('Error sending verification email:', error); setError('Failed to send verification email'); } setIsProfileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-600 rounded">Verify Email</button>
                </div>
              )}
              <div className={isMobile ? 'mt-2' : 'py-1'}>
                <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-md" onClick={() => {setIsProfileMenuOpen(false); isMobile && setIsMobileMenuOpen(false);}}><FiUser className="mr-2" /> Profile</Link>
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-600 text-left rounded-md"><FiLogOut className="mr-2" /> Sign out</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'flex-row items-center space-x-2'}`}>
          <Link to="/login" className={`py-2 px-4 text-center rounded-md transition-colors ${isMobile ? 'w-full bg-gray-200 dark:bg-gray-700' : 'w-24 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Login</Link>
          <Link to="/signup" className={`py-2 px-4 text-center rounded-md transition-colors ${isMobile ? 'w-full bg-blue-500' : 'w-24 bg-blue-500 text-white hover:bg-blue-600'}`} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-white dark:bg-zinc-800 p-4 shadow-md rounded-b-lg sticky top-0 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Aries</h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks isMobile={false} />
            <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-zinc-600"></div>
            <AuthButtons isMobile={false} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800 dark:text-white focus:outline-none">
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Slide-out Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-zinc-800 shadow-lg z-50 transform transition-transform md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 dark:text-white focus:outline-none">
            <FiX size={24} />
          </button>
        </div>
        <div className="p-4 flex flex-col space-y-4">
          <NavLinks isMobile={true} />
          <div className="border-t border-gray-200 dark:border-zinc-700 my-2"></div>
          <AuthButtons isMobile={true} />
        </div>
      </div>
    </>
  );
};

export default NavBar;
