import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userId } = useParams();
  const user = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');
  
  // Check if both user and session_id exist in localStorage
  if (!user || !sessionId) {
    // Redirect to login page if authentication data is missing
    return <Navigate to="/" replace />;
  }
  
  // Check if userId parameter matches session_id (when userId is present in route)
  if (userId && userId !== sessionId) {
    // Redirect to login or unauthorized page if userId doesn't match session_id
    return <Navigate to="/" replace />;
  }
  
  // If authentication checks pass, render the protected component
  return children;
};

export default ProtectedRoute;