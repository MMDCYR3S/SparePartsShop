import React from "react";
import { Link } from "react-router-dom";
import { useShopAuth } from "@/context/ShopAuthContext";
import { 
  Bars3BottomRightIcon, // آیکون منوی همبرگری مدرن
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon
} from "@heroicons/react/24/outline";

const ShopHeader = ({ onToggleSidebar }) => {
  const { user } = useShopAuth();

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-30 shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Right: Hamburger & Search */}
        <div className="flex items-center gap-3">
            <button 
                onClick={onToggleSidebar}
                className="p-2 -mr-2 text-primary hover:bg-gray-50 rounded-full active:scale-90 transition-all"
            >
                <Bars3BottomRightIcon className="w-7 h-7" />
            </button>
            <button className="p-2 text-gray-500 hover:text-primary transition-colors">
                <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-accent font-black shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                S
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">Spare<span className="text-accent">Parts</span></span>
        </Link>

        {/* Left: Cart & User Status */}
        <div className="flex items-center gap-3">
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-primary hover:text-primary-light transition-colors">
                <ShoppingBagIcon className="w-6 h-6" />
                <span className="absolute top-1 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-accent text-[9px] font-bold text-primary items-center justify-center">0</span>
                </span>
            </Link>

            {/* User Button (Desktop mainly, but good for Tablet) */}
            <div className="hidden md:block">
                {user ? (
                    <Link to="/profile" className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition">
                        <span className="text-xs font-bold text-gray-700">{user.username}</span>
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                            {user.username?.[0]?.toUpperCase()}
                        </div>
                    </Link>
                ) : (
                    <Link to="/login" className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow hover:bg-primary-light transition">
                        ورود
                    </Link>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;