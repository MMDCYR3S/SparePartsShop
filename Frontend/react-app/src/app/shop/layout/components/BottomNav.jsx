import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  Squares2X2Icon, 
  ShoppingCartIcon, 
  UserIcon 
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";

const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { id: "home", path: "/", icon: HomeIcon, label: "خانه" },
    { id: "products", path: "/products", icon: Squares2X2Icon, label: "محصولات" },
    { id: "cart", path: "/cart", icon: ShoppingCartIcon, label: "سبد" },
    { id: "profile", path: "/profile", icon: UserIcon, label: "پروفایل" },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center pointer-events-none pb-safe">
      
      {/* کانتینر اصلی */}
      <div 
        className="pointer-events-auto w-auto min-w-[340px] h-[70px] glass rounded-full flex items-center justify-between p-2 gap-2 transition-all duration-300 ease-out"
        style={{ willChange: 'transform, width' }}
      >
        
        {navItems.map((item) => {
          // اصلاح منطق فعال بودن: تطابق دقیق فقط برای خانه، بقیه موارد تطابق ابتدای آدرس
          const isActive = item.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                relative h-full rounded-full flex items-center justify-center overflow-hidden
                /* سرعت انیمیشن رو کردم 500ms که سریع‌تر بشه */
                transition-[flex-grow,background-color,color,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isActive 
                  ? 'flex-[2.8] bg-[#0f172a] text-[#facc15] shadow-lg shadow-[#0f172a]/20' 
                  : 'flex-[1] text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }
              `}
            >
              {/* آیکون */}
              <item.icon 
                className={`
                  flex-shrink-0 transition-all duration-300 
                  ${isActive ? 'w-6 h-6 stroke-[2px] rotate-0' : 'w-6 h-6 stroke-[1.5px]'}
                `} 
              />

              {/* متن */}
              <span 
                className={`
                  text-sm font-black mr-2 whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isActive ? 'opacity-100 max-w-[100px] translate-x-0 delay-75' : 'opacity-0 max-w-0 -translate-x-8'}
                `}
              >
                {item.label}
              </span>

              {/* هندلینگ سبد خرید */}
              {item.id === "cart" && cartCount > 0 && (
                isActive ? (
                  <span className="mr-2 bg-[#facc15] text-[#0f172a] px-2 py-0.5 rounded-full text-[10px] font-black animate-[scaleIn_0.3s_ease-out]">
                    {cartCount}
                  </span>
                ) : (
                  <span className="absolute top-3 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;