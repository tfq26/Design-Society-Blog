import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FiUser, FiLogOut, FiChevronDown, FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-orange-wheel h-14 shadow-md sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className="text-white hover:text-gray-200 transition-colors"
          >
            Posts
          </Link>
          <Link
            to="/events"
            className="text-white hover:text-gray-200 transition-colors"
          >
            Events
          </Link>
          {currentUser?.isAdmin && (
            <>
              <Link
                to="/create"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Create Post
              </Link>
              <Link
                to="/admin"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Admin
              </Link>
            </>
          )}

          {/* Profile */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 focus:outline-none"
                title="Profile"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.displayName?.charAt(0).toUpperCase() ||
                      currentUser.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}
                <FiChevronDown
                  className={`text-white transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-2 z-50"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="inline mr-2" /> Profile
                    </Link>
                    {currentUser?.isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center cursor-pointer"
                    >
                      <FiLogOut className="mr-2" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm rounded-md bg-white text-orange-wheel hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <FiMenu size={24} />
          </button>

          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white dark:bg-zinc-900 shadow-lg z-50 flex flex-col"
              >
                <div className="p-4 flex justify-between items-center border-b">
                  <span className="font-semibold text-lg">Menu</span>
                  <button
                    className="text-gray-600 dark:text-gray-300"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 flex flex-col p-4 space-y-4">
                  <Link to="/dashboard" onClick={() => setIsMobileOpen(false)} className="py-2">
                    Posts
                  </Link>
                  <Link to="/events" onClick={() => setIsMobileOpen(false)} className="py-2">
                    Events
                  </Link>
                  {currentUser && (
                    <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="py-2">
                      Profile
                    </Link>
                  )}
                  {currentUser?.isAdmin && (
                    <>
                      <Link to="/create" onClick={() => setIsMobileOpen(false)} className="py-2">
                        Create Post
                      </Link>
                      <Link to="/admin" onClick={() => setIsMobileOpen(false)} className="py-2">
                        Admin
                      </Link>
                    </>
                  )}
                </div>
                <div className="p-4 border-t">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left text-red-600"
                    >
                      <FiLogOut className="inline mr-2" /> Sign out
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <Link
                        to="/login"
                        className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-center"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="flex-1 px-4 py-2 rounded-md bg-blue-500 text-white text-center"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
