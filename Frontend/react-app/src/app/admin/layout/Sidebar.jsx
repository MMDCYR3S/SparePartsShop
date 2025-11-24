import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  TruckIcon, 
  CubeIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  Cog6ToothIcon, 
  BeakerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navItems = [
    { name: 'داشبورد', path: '/admin/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'مدیریت دسته‌ها', path: '/admin/categories', icon: <TruckIcon className="w-5 h-5" /> },
    { name: 'محصولات', path: '/admin/products', icon: <CubeIcon className="w-5 h-5" /> },
    { name: 'سفارشات', path: '/admin/orders', icon: <ShoppingCartIcon className="w-5 h-5" /> },
    { name: 'کاربران', path: '/admin/users', icon: <UsersIcon className="w-5 h-5" /> },
    { name: 'تنظیمات', path: '/admin/settings', icon: <Cog6ToothIcon className="w-5 h-5" /> },
    { name: 'تست API', path: '/admin/test', icon: <BeakerIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Overlay برای موبایل */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeSidebar}
      />

      <aside 
        className={`
          fixed inset-y-0 right-0 z-30 w-64 
          bg-[#0f172a] text-slate-300 border-l border-slate-800
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static 
          ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
        `}
      >
        {/* هدر سایدبار: لوگوی تایپوگرافیک و ساده */}
        <div className="h-[70px] flex items-center px-6 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#facc15] flex items-center justify-center text-[#0f172a]">
                    <span className="font-bold text-lg">A</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                    Admin<span className="text-[#facc15]">Panel</span>
                </h2>
            </div>
            
            {/* دکمه بستن در موبایل */}
            <button onClick={closeSidebar} className="lg:hidden mr-auto text-slate-400 hover:text-[#facc15] transition-colors">
               <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        {/* لیست منوها */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">منوی اصلی</p>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800/50 text-[#facc15]' 
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* خط نشانگر فعال بودن (سمت راست) - ظریف */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#facc15] rounded-l-full shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                  )}

                  <span className={`ml-3 transition-colors duration-200 ${isActive ? 'text-[#facc15]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {/* آیکون‌ها با stroke نازک‌تر برای ظرافت بیشتر */}
                    {React.cloneElement(item.icon, { strokeWidth: 1.5 })}
                  </span>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* فوتر سایدبار */}
        <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors cursor-pointer group">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">وضعیت سیستم: آنلاین</span>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;