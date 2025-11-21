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
    { name: 'داشبورد', path: '/admin/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
    { name: 'دسته بندی', path: '/admin/categories', icon: <TruckIcon className="w-6 h-6" /> },
    { name: 'محصولات', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
    { name: 'سفارشات', path: '/admin/orders', icon: <ShoppingCartIcon className="w-6 h-6" /> },
    { name: 'کاربران', path: '/admin/users', icon: <UsersIcon className="w-6 h-6" /> },
    { name: 'تنظیمات', path: '/admin/settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
    { name: 'تست API', path: '/admin/test', icon: <BeakerIcon className="w-6 h-6" /> },
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 right-0 z-30 w-72 bg-primary text-white shadow-2xl transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* گرادینت پس‌زمینه */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-light/20 to-primary pointer-events-none" />

      {/* هدر سایدبار */}
      <div className="h-20 flex items-center justify-between px-6 z-10 border-b border-white/5">
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 mr-3">
            <span className="text-primary font-black text-xl">A</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-white">Admin<span className="text-accent">Panel</span></h2>
          </div>
        </div>

        {/* دکمه بستن (فقط در موبایل دیده میشه) */}
        <button onClick={closeSidebar} className="lg:hidden text-gray-400 hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* لیست منوها */}
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4 z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeSidebar} // بستن سایدبار در موبایل بعد از کلیک
            className={({ isActive }) =>
              `relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-accent to-accent-hover text-primary shadow-lg shadow-accent/20 font-bold translate-x-1'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="mr-3 text-base">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;