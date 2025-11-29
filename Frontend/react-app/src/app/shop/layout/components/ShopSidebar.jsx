import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShopAuth } from "@/context/ShopAuthContext";
import { useCategories } from "@/app/shop/hooks/useCategories";
import { useCars } from "@/app/shop/hooks/useCars";
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronDownIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  TagIcon,
  TruckIcon,
  HomeIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

const ShopSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useShopAuth();
  const navigate = useNavigate();
  
  // دریافت دیتا برای منوها
  const { categories, loading: catLoading } = useCategories(true);
  const { cars, loading: carLoading } = useCars(true);

  // استیت برای مدیریت باز/بسته بودن آکاردئون‌ها
  // null = همه بسته, 'categories' = دسته‌ها باز, 'cars' = ماشین‌ها باز
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null); // بستن اگر قبلاً باز بود
    } else {
      setExpandedSection(section); // باز کردن بخش جدید
    }
  };

  const handleProfileClick = () => {
    onClose();
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // هندلر کلیک روی دسته‌بندی
  const handleCategorySelect = (catId) => {
    onClose();
    // نویگیت به صفحه محصولات با کوئری پارامتر
    navigate(`/products?category=${catId}`);
  };

  // هندلر کلیک روی خودرو
  const handleCarSelect = (carModel) => {
    onClose();
    navigate(`/products?car_model=${carModel}`);
  };

  return (
    <>
      {/* Backdrop (لایه تاریک پشت) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-surface 
          shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
          flex flex-col h-full
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* 1. Header & Profile (Design: Curved Bottom) */}
        <div className="bg-primary text-white pt-6 pb-10 px-6 rounded-bl-[2.5rem] shadow-lg relative overflow-hidden flex-shrink-0">
            {/* Abstract bg shape */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="font-black text-xl tracking-tight">منوی اصلی</h2>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition active:scale-90">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Card */}
            <div 
                onClick={handleProfileClick}
                className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-md cursor-pointer active:scale-95 transition-transform relative z-10"
            >
                <div className="w-12 h-12 rounded-full bg-surface-dark/20 border border-accent/50 p-0.5 flex-shrink-0">
                    {user?.photo ? (
                        <img src={user.photo} className="w-full h-full rounded-full object-cover" alt="User" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <UserCircleIcon className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {user ? (
                        <>
                            <p className="font-bold text-base truncate">{user.first_name || user.username}</p>
                            <p className="text-xs text-gray-300 truncate opacity-80">{user.email || 'کاربر طلایی'}</p>
                        </>
                    ) : (
                        <>
                            <p className="font-bold text-base">کاربر مهمان</p>
                            <p className="text-xs text-accent">برای ورود کلیک کنید</p>
                        </>
                    )}
                </div>
                <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
            </div>
        </div>

        {/* 2. Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-3 scrollbar-hide">
            
            {/* لینک صفحه اصلی */}
            <Link to="/" onClick={onClose} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                <HomeIcon className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-sm text-gray-700">صفحه اصلی</span>
            </Link>

            {/* لینک تمام محصولات */}
            <Link to="/products" onClick={onClose} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                <ShoppingBagIcon className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-sm text-gray-700">همه محصولات</span>
            </Link>

            {/* --- Accordion: Categories --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('categories')}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${expandedSection === 'categories' ? 'bg-gray-50' : 'bg-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <TagIcon className={`w-5 h-5 ${expandedSection === 'categories' ? 'text-primary' : 'text-gray-500'}`} />
                        <span className="font-bold text-sm text-gray-700">دسته‌بندی قطعات</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedSection === 'categories' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedSection === 'categories' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-50/50 p-2 space-y-1">
                        {catLoading ? (
                            <p className="text-xs text-gray-400 p-3 text-center">در حال بارگذاری...</p>
                        ) : categories.length === 0 ? (
                            <p className="text-xs text-gray-400 p-3 text-center">دسته ای یافت نشد</p>
                        ) : (
                            categories.map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs font-medium text-gray-600 active:scale-98"
                                >
                                    <span>{cat.name}</span>
                                    <ChevronLeftIcon className="w-3 h-3 text-gray-300" />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- Accordion: Cars --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection('cars')}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${expandedSection === 'cars' ? 'bg-gray-50' : 'bg-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <TruckIcon className={`w-5 h-5 ${expandedSection === 'cars' ? 'text-primary' : 'text-gray-500'}`} />
                        <span className="font-bold text-sm text-gray-700">بر اساس خودرو</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedSection === 'cars' ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedSection === 'cars' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-50/50 p-2 space-y-1 overflow-y-auto max-h-64 scrollbar-hide">
                        {carLoading ? (
                            <p className="text-xs text-gray-400 p-3 text-center">در حال بارگذاری...</p>
                        ) : cars.length === 0 ? (
                            <p className="text-xs text-gray-400 p-3 text-center">خودرویی یافت نشد</p>
                        ) : (
                            cars.map(car => (
                                <button 
                                    key={car.id} 
                                    onClick={() => handleCarSelect(car.model)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-xs font-medium text-gray-600 active:scale-98"
                                >
                                    <span>{car.make} - {car.model}</span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{car.year}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* تماس با ما */}
            <Link to="/contact" onClick={onClose} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors mt-6">
                <PhoneIcon className="w-5 h-5 text-accent" />
                <span className="font-bold text-sm text-gray-700">ارتباط با ما</span>
            </Link>

        </div>

        {/* 3. Footer */}
        <div className="pb-20 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            {user ? (
                <button 
                    onClick={() => { logout(); onClose(); }} 
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition active:scale-95"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    خروج از حساب
                </button>
            ) : (
                <div className="text-center ">
                    <p className="text-xs text-gray-400 mb-1">نسخه ۱.۰.۰</p>
                    <p className="text-[10px] text-gray-300">طراحی شده با ❤️</p>
                </div>
            )}
        </div>
      </aside>
    </>
  );
};

export default ShopSidebar;