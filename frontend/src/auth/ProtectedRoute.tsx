import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const useAuth = () => {
  // Hardcoded role for scaffolding
  const user = { role: 'admin', name: 'Test User' };
  
  const login = async (username, password) => {
    console.log("Login stub", username);
    return true;
  };

  const logout = () => {
    console.log("Logout stub");
  };

  return { user, login, logout, isAuthenticated: !!user };
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div>Unauthorized</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
