import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden relative" dir="rtl">
      
      {/* لایه تاریک پشت سایدبار در موبایل (Backdrop) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* سایدبار */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
      />

      {/* بخش اصلی */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        
        {/* هدر (تابع باز کردن سایدبار رو بهش میدیم) */}
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* محتوا */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;