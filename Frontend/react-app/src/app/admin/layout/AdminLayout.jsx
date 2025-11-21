// src/app/admin/layout/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 min-w-screen" dir='rtl'>
      {/* سایدبار در سمت چپ */}
      <Sidebar />

      {/* بخش اصلی در سمت راست */}
      <div className="flex-1 flex flex-col">
        {/* هدر در بالا */}
        <Header />

        {/* محتوای صفحات در زیر هدر */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;