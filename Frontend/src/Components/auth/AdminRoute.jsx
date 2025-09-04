import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.isAdmin) {
    // User is not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is an admin, render the children
  return children;
};

export default AdminRoute;
