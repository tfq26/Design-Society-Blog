import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show loading state while checking auth status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    // User not logged in, redirect to login
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (!currentUser.isAdmin) {
    // User is not an admin, redirect to home with a message
    return <Navigate to="/" state={{ adminAccessDenied: true }} replace />;
  }

  // User is an admin, render the children
  return children;
};

export default AdminRoute;
