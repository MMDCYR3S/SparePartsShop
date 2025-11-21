// src/app/admin/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">پنل مدیریت</h1>
        <div className="flex items-center gap-4 gap-reverse">
          <span className="text-gray-600">خوش آمدی، {user?.username}</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;