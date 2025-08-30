import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiUser, FiLogOut, FiMenu, FiX, FiChevronDown, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';

const NavBar = () => {
  const { currentUser, logout, sendEmailVerification } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(false);
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
      console.error(error);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(false);
    if (isMobile) {
      setIsMobileMenuOpen(false);
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

  // Navigation links component
  const NavLinks = ({ onLinkClick }) => (
    <div className="space-y-4 py-4">
      <Link 
        to="/"
        className="block w-full py-2 px-4 rounded-md text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
        onClick={onLinkClick}
      >
        Blog
      </Link>
      {currentUser && (
        <Link 
          to="/create" 
          className="block w-full py-2 px-4 rounded-md text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          onClick={onLinkClick}
        >
          Create Post
        </Link>
      )}
    </div>
  );

  // User profile dropdown component
  const UserProfile = ({ onLinkClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="border-t border-gray-200 dark:border-zinc-700 pt-4 mt-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-3">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-10 h-10 rounded-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </p>
              <div className="flex items-center">
                {currentUser.emailVerified ? (
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center">
                    <FiCheckCircle className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                    <FiAlertCircle className="mr-1" /> Verify Email
                  </span>
                )}
              </div>
            </div>
          </div>
          <FiChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1 pl-14">
            {!currentUser.emailVerified && (
              <button 
                onClick={async () => {
                  try { 
                    await sendEmailVerification(currentUser); 
                    setError(''); 
                    alert('Verification email sent.'); 
                  } catch (error) { 
                    console.error('Error sending verification email:', error); 
                    setError('Failed to send verification email'); 
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-600 rounded-md"
              >
                Verify Email
              </button>
            )}
            <Link 
              to="/profile" 
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-md"
              onClick={onLinkClick}
            >
              <FiUser className="inline mr-2" /> Profile
            </Link>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onLinkClick();
                handleLogout(e);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded-md cursor-pointer"
            >
              <FiLogOut className="inline mr-2" /> Sign out
            </button>
          </div>
        )}
      </div>
    );
  };

  // Auth buttons for non-logged in users
  const AuthButtons = ({ onLinkClick }) => (
    <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-zinc-700 mt-4">
      <Link 
        to="/login" 
        className="w-full py-2 px-4 text-center rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        onClick={onLinkClick}
      >
        Login
      </Link>
      <Link 
        to="/signup" 
        className="w-full py-2 px-4 text-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        onClick={onLinkClick}
      >
        Sign Up
      </Link>
    </div>
  );

  return (
    <nav className="bg-white dark:bg-orange-wheel p-2 shadow-md sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="" className="w-16" /> 
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {currentUser && (
            <Link 
              to="/create" 
              className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-beige transition-colors"
            >
              Create Post
            </Link>
          )}
          
          {currentUser ? (
            <div className="relative ml-4" ref={menuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-expanded={isProfileMenuOpen}
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <FiChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-700 rounded-md shadow-lg py-1 z-50 divide-y divide-gray-100 dark:divide-zinc-600">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  {!currentUser.emailVerified && (
                    <div className="py-1">
                      <button 
                        onClick={async () => {
                          try { 
                            await sendEmailVerification(currentUser); 
                            setError(''); 
                            alert('Verification email sent.'); 
                          } catch (error) { 
                            console.error('Error sending verification email:', error); 
                            setError('Failed to send verification email'); 
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-600"
                      >
                        Verify Email
                      </button>
                    </div>
                  )}
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="inline mr-2" /> Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-600 flex items-center cursor-pointer"
                    >
                      <FiLogOut className="mr-2 " /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3 ml-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm rounded-md bg-beige/80 text-black hover:bg-beige transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm rounded-md bg-ash-gray/80 text-white hover:bg-ash-gray transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-gray-800 dark:text-white focus:outline-none cursor-pointer">
                <FiMenu size={24} className="cursor-pointer" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-4/5 max-w-sm flex flex-col p-0 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">
              <SheetHeader className="p-6 border-b dark:border-zinc-700">
                <SheetTitle className="text-xl text-gray-800 dark:text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-6 text-gray-800 dark:text-white">
                <NavLinks onLinkClick={() => document.querySelector('[data-state=open] button')?.click()} />
              </div>
              <div className="p-6 border-t dark:border-zinc-700 mt-auto">
                {currentUser ? (
                  <UserProfile onLinkClick={() => document.querySelector('[data-state=open] button')?.click()} />
                ) : (
                  <AuthButtons onLinkClick={() => document.querySelector('[data-state=open] button')?.click()} />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
