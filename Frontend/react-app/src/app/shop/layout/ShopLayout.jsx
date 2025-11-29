import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ShopHeader from "./components/ShopHeader";
import BottomNav from "./components/BottomNav";
import ShopSidebar from "./components/ShopSidebar";

const ShopLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans" dir="rtl">
      
      {/* 1. Header (Sticky) */}
      <ShopHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* 2. Sidebar (Mobile Drawer) */}
      <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 3. Main Content */}
      {/* پدینگ پایین برای اینکه محتوا زیر نوار پایین نره */}
      <main className=" pb-24 md:pb-8 animate-fade-in p-1">
        <Outlet />
      </main>

      {/* 4. Bottom Navigation (Mobile Only) */}
      <BottomNav />

      {/* 5. Desktop Footer (Optional) */}
      <footer className="hidden md:block bg-primary-dark text-gray-400 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 فروشگاه قطعات یدکی. طراحی شده برای تجربه کاربری عالی.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;