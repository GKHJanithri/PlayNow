import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const location = useLocation();
  
  // Grab items from storage
  const role = localStorage.getItem('role') || 'Guest';
  const token = localStorage.getItem('token');

  // 1. If no token, bounce to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Make the role check completely case-insensitive
  const normalizedUserRole = role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

  const isAllowed = allowedRoles.length === 0 || normalizedAllowedRoles.includes(normalizedUserRole);

  // 3. If they have a token but the wrong role, bounce to events
  if (!isAllowed) {
    console.warn(`Access Denied: User role '${role}' not in allowed roles: ${allowedRoles}`);
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default ProtectedRoute;