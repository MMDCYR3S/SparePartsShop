// src/app/admin/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css'

const Sidebar = () => {
  const navItems = [
    { name: 'داشبورد', path: '/admin/dashboard', icon: '🏠' },
    { name: 'ماشین‌ها', path: '/admin/cars', icon: '🚗' },
    { name: 'محصولات', path: '/admin/products', icon: '📦' },
    { name: 'سفارشات', path: '/admin/orders', icon: '🛒' },
    { name: 'کاربران', path: '/admin/users', icon: '👥' },
    { name: 'تنظیمات', path: '/admin/settings', icon: '⚙️' },
    { name: 'تست API', path: '/admin/test', icon: '🧪' },
  ];

  return (
    <aside className="w-64 bg-slate-950 min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold">مدیریت</h2>
      </div>
      <nav className="mt-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 text-red-white py-3 transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black text-lg rounded-r-xl mr-4 '
                  : 'hover:bg-white/50 hover:mr-4 hover:text-black rounded-r-xl '
              }`
            }
          >
            <span className="ml-3 text-xl text-black bg-white w-7 h-7 flex items-center justify-center rounded-full">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;