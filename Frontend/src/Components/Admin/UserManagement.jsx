import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../Api/api';
import { useAuth } from '../../contexts/AuthContext';

export const UserManagement = () => {
  const { currentUser, setAdminStatus } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Get all users (in a real app, you'd want to paginate this)
        const usersRef = collection(db, 'users');
        const q = searchEmail 
          ? query(usersRef, where('email', '>=', searchEmail), where('email', '<=', searchEmail + '\uf8ff'))
          : usersRef;
          
        const querySnapshot = await getDocs(q);
        const usersList = [];
        
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchEmail]);

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      await setAdminStatus(userId, !currentStatus);
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-eerie-black dark:text-beige">User Management</h2>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search by email..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e8a087] focus:border-transparent"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Admin Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                        {user.photoURL ? (
                          <img className="h-full w-full object-cover" src={user.photoURL} alt={user.displayName} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.displayName || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.uid === currentUser.uid ? '(You)' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.uid !== currentUser.uid && (
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        className={`mr-3 ${user.isAdmin ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'}`}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {searchEmail ? 'No users found matching your search' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
