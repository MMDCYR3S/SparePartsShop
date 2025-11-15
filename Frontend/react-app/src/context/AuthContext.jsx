// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// ۱. این خط رو اصلاح کن: از آکولاد استفاده کن و jwtDecode بنویس
import { jwtDecode } from 'jwt-decode';

// ۲. ساخت خود Context
const AuthContext = createContext(null);

// ۳. ساخت Provider (تأمین‌کننده)
export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens')
      ? // ۴. اینجا هم jwtDecode رو استفاده کن
        jwtDecode(localStorage.getItem('authTokens'))
      : null
  );
  
  const navigate = useNavigate();

  // ۵. تابع ورود
  const login = async (username, password, loginApiFunction) => {
    try {
      const data = await loginApiFunction(username, password);
      setAuthTokens(data);
      // ۶. اینجا هم jwtDecode رو استفاده کن
      setUser(jwtDecode(data.access));
      localStorage.setItem('authTokens', JSON.stringify(data));
      navigate('/admin/dashboard');
    } catch (error) {
      throw error;
    }
  };

  // ۷. تابع خروج
  const logout = async () => {
    if (!authTokens) {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/admin/login');
        return;
    }
    
    try {
        // await adminLogout(authTokens.refresh);
    } catch (error) {
        console.error("Logout API call failed", error);
    } finally {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/admin/login');
    }
  };

  const contextData = {
    user,
    authTokens,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;