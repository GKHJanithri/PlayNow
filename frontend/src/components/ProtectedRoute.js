import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'Guest';
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!isAllowed) {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default ProtectedRoute;
