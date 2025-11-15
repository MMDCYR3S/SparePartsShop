// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // اگه کاربر لاگین نکرده بود، ببرش به صفحه لاگین
    return <Navigate to="/admin/login" />;
  }

  // در غیر این صورت، کامپوننت مورد نظر رو نمایش بده
  return children;
};

export default ProtectedRoute;