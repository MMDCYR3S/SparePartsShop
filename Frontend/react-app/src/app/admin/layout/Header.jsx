import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ArrowRightStartOnRectangleIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      
      {/* سمت راست: دکمه منو + سرچ */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        
        {/* دکمه همبرگری (فقط موبایل) */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>

        {/* سرچ بار */}
        <div className="relative w-full max-w-md group hidden md:block">
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </span>
          <input 
            type="text" 
            placeholder="جستجو..." 
            className="w-full bg-gray-100/50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 rounded-xl py-2.5 pr-10 pl-4 text-sm transition-all duration-300"
          />
        </div>
      </div>

      {/* سمت چپ: اکشن‌ها */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-2 left-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user?.username || 'کاربر'}</p>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center bg-red-50 hover:bg-red-500 hover:text-white text-red-600 w-10 h-10 md:w-auto md:px-4 md:py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
            title="خروج"
          >
            <span className="hidden md:inline ml-2">خروج</span>
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;