import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  HomeIcon, 
  Squares2X2Icon, 
  ShoppingCartIcon, 
  UserIcon,
} from "@heroicons/react/24/outline";
import { useShopAuth } from "@/context/ShopAuthContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useShopAuth();
  
  // استیت برای مدیریت انیمیشن کلیک (کدام دکمه الان انیمیشن بخورد)
  const [animatingBtn, setAnimatingBtn] = useState(null);

  const handleNavClick = (path, e) => {
    // 1. اجرای انیمیشن
    setAnimatingBtn(path);
    setTimeout(() => setAnimatingBtn(null), 400); // زمان انیمیشن ژله‌ای

    // 2. منطق هوشمند پروفایل
    if (path === "/profile" && !user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const navItems = [
    { id: "home", name: "خانه", path: "/", icon: HomeIcon },
    { id: "products", name: "محصولات", path: "/products", icon: Squares2X2Icon },
    // سبد خرید (وسط و شناور)
    { id: "cart", name: "سبد خرید", path: "/cart", icon: ShoppingCartIcon, isFloating: true },
    { id: "profile", name: user ? "پروفایل" : "ورود", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">
      
      {/* نگهدارنده داک (Glassmorphism) */}
      <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe pt-2 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-t-3xl transition-all duration-300">
        
        <div className="flex justify-around items-end h-16 relative">
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isAnimating = animatingBtn === item.path;

            // --- استایل دکمه شناور (سبد خرید) ---
            if (item.isFloating) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className="relative -top-8 group"
                >
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center 
                    shadow-[0_8px_25px_rgba(250,204,21,0.4)] border-4 border-surface 
                    transition-all duration-300 ease-out
                    ${isActive ? 'bg-primary text-accent scale-110' : 'bg-accent text-primary hover:scale-105'}
                    ${isAnimating ? 'animate-jelly' : ''}
                  `}>
                    <item.icon className="w-7 h-7" strokeWidth={2} />
                    
                    {/* بج تعداد (مثلاً اگر دیتا بود) */}
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      2
                    </span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            }

            // --- استایل دکمه‌های معمولی ---
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1.5 h-full relative group
                  ${isAnimating ? 'animate-jelly' : ''}
                `}
              >
                {/* آیکون */}
                <div className={`
                  relative p-1.5 rounded-xl transition-all duration-300
                  ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}
                `}>
                  <item.icon className={`w-7 h-7 transition-all duration-300 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
                  
                  {/* نقطه نشانگر فعال بودن */}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_#facc15] animate-slide-up"></span>
                  )}
                </div>

                {/* متن */}
                <span className={`
                  text-[10px] font-bold transition-colors duration-300
                  ${isActive ? 'text-primary' : 'text-gray-400'}
                `}>
                  {item.name}
                </span>
                
                {/* افکت نورانی پس‌زمینه هنگام اکتیو بودن */}
                {isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent/10 rounded-full blur-xl -z-10"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;