import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

function RouteProtectedUser({ allowedRoles = [], children }) {
  const token  = localStorage.getItem('token');
  const roleId = parseInt(localStorage.getItem('role_id'), 10);
  const loc    = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  if (!allowedRoles.includes(roleId)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default RouteProtectedUser
