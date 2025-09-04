import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can return a loading spinner here if you want
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
