import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShopAuth } from "@/context/ShopAuthContext";
import { 
  XMarkIcon, 
  ChevronLeftIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

const ShopSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useShopAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    onClose();
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-surface 
          shadow-2xl transform transition-transform duration-300 ease-out-expo
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 1. Header & Profile Section (Curved Bottom) */}
        <div className="bg-primary text-white pt-6 pb-8 px-6 rounded-bl-[2.5rem] shadow-lg relative overflow-hidden">
            {/* Background Pattern (Optional) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-xl tracking-tight">منوی کاربری</h2>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-90">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Card Clickable */}
            <div 
                onClick={handleProfileClick}
                className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-md cursor-pointer active:scale-98 transition-transform"
            >
                <div className="w-14 h-14 rounded-full bg-surface-dark/20 border-2 border-accent p-0.5">
                    {user?.photo ? (
                        <img src={user.photo} className="w-full h-full rounded-full object-cover" alt="User" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <UserCircleIcon className="w-10 h-10" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {user ? (
                        <>
                            <p className="font-bold text-lg truncate">{user.first_name || user.username}</p>
                            <p className="text-xs text-gray-300 truncate">{user.email || 'خوش آمدید'}</p>
                        </>
                    ) : (
                        <>
                            <p className="font-bold text-lg">کاربر مهمان</p>
                            <p className="text-xs text-accent">برای ورود کلیک کنید</p>
                        </>
                    )}
                </div>
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
            </div>
        </div>

        {/* 2. Body (Categories Placeholder) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">دسته‌بندی محصولات</p>
            
            {/* Skeleton / Placeholder for future accordion */}
            <div className="space-y-3 opacity-60">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
                ))}
            </div>
            
            <div className="mt-8">
                <Link to="/contact" onClick={onClose} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 text-gray-700 font-bold">
                    <PhoneIcon className="w-5 h-5 text-accent" />
                    ارتباط با ما
                </Link>
            </div>
        </div>

        {/* 3. Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
            {user ? (
                <button 
                    onClick={() => { logout(); onClose(); }} 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition active:scale-95"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    خروج از حساب
                </button>
            ) : (
                <p className="text-center text-xs text-gray-400">نسخه ۱.۰.۰</p>
            )}
        </div>
      </aside>
    </>
  );
};

export default ShopSidebar;