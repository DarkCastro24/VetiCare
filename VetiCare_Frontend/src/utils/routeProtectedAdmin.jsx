import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function RouteProtectedAdmin({ allowedAdminTypes = [] }) {
  const token= localStorage.getItem('token');
  const adminType  = parseInt(localStorage.getItem('admin_type_id'), 10);
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: loc }} />;
  }
  if (!allowedAdminTypes.includes(adminType)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default RouteProtectedAdmin