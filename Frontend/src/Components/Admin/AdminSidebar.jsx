import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLayout, 
  FiCalendar, 
  FiFileText, 
  FiUsers, 
  FiLogOut,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, darkMode, toggleDarkMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <FiLayout className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'events', icon: <FiCalendar className="w-5 h-5" />, label: 'Events' },
    { id: 'posts', icon: <FiFileText className="w-5 h-5" />, label: 'Posts' },
    { id: 'users', icon: <FiUsers className="w-5 h-5" />, label: 'Users' },
  ];

  return (
    <div className={`w-64 h-screen flex flex-col border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-200`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design Society</h1>
        {currentUser && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome, <span className="font-medium text-indigo-600 dark:text-indigo-400">{currentUser.displayName || 'Admin'}</span>
          </p>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className={`mr-3 ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {activeTab === item.id && (
                  <FiChevronRight className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              darkMode ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <FiLogOut className="mr-2" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
