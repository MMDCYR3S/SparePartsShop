import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-[70px] px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm transition-all duration-300">
      
      {/* سمت راست: منو و جستجو */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* دکمه همبرگری موبایل */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 hover:text-[#0f172a] rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6" strokeWidth={1.5} />
        </button>

        {/* سرچ بار - ظریف و بدون حاشیه سنگین */}
        <div className="hidden md:block relative w-full max-w-sm group">
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 group-focus-within:text-[#facc15] transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <input 
            type="text" 
            placeholder="جستجو..." 
            className="w-full bg-gray-50/80 border-none focus:bg-white focus:ring-1 focus:ring-gray-200 rounded-full py-2 pr-10 pl-4 text-sm text-gray-600 placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-none"
          />
        </div>
      </div>

      {/* سمت چپ: پروفایل و ابزارها */}
      <div className="flex items-center gap-3">
        
        {/* دکمه نوتیفیکیشن */}
        <button className="relative p-2 text-gray-400 hover:text-[#0f172a] hover:bg-gray-50 rounded-full transition-all duration-300">
          <BellIcon className="w-6 h-6" strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#facc15] rounded-full border border-white"></span>
        </button>

        {/* خط جداکننده عمودی نازک */}
        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

        {/* بخش کاربر */}
        <div className="flex items-center gap-3 pl-1 group cursor-pointer relative">
          {/* اطلاعات متنی (فقط دسکتاپ) */}
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-[#0f172a]">{user?.username || 'مدیر ارشد'}</p>
            <p className="text-[10px] text-gray-400 text-right">Admin</p>
          </div>

          {/* آواتار */}
          <div className="w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#facc15]/50 transition-all">
             <span className="text-sm font-medium pt-0.5">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          
          <ChevronDownIcon className="w-3 h-3 text-gray-400 hidden md:block group-hover:text-[#0f172a] transition-colors" strokeWidth={2} />

          {/* دکمه خروج (مینیمال) */}
          <button
            onClick={logout}
            className="hidden md:flex items-center justify-center w-8 h-8 ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="خروج"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;