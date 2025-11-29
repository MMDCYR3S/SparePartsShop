// src/app/shop/pages/profile/ProfileDashboard.jsx
import React, { useEffect } from "react";
import { useCustomer } from "@/app/shop/hooks/useCustomer";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, MapPin, ShoppingBag, ChevronLeft, LogOut, 
  ShieldCheck, Wallet, Camera 
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useShopAuth } from "@/context/ShopAuthContext";

const ProfileDashboard = () => {
  const { profile, fetchProfile, loadingProfile } = useCustomer();
  const { logout } = useShopAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loadingProfile && !profile) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="pb-24 p-4 animate-fade-in">
      
      {/* 1. Header & Avatar Section */}
      <div className="glass rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-primary/5"></div>
        
        <div className="relative z-10">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full p-1 border-2 border-dashed border-gray-300 relative group">
                <img 
                    src={profile?.photo || "https://via.placeholder.com/150"} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-accent text-primary p-1.5 rounded-full shadow-md" onClick={() => navigate('info')}>
                    <Camera size={16} />
                </button>
            </div>
            
            <h1 className="mt-4 text-xl font-black text-gray-800">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.username}
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-1">{profile?.phone || profile?.email}</p>
        </div>
      </div>

      {/* 2. Stats Row (Optional) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center text-blue-800">
            <span className="text-2xl font-black">۰</span>
            <span className="text-xs font-bold opacity-70">سفارش فعال</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl flex flex-col items-center justify-center text-amber-800">
            <span className="text-2xl font-black">۰</span>
            <span className="text-xs font-bold opacity-70">امتیاز باشگاه</span>
        </div>
      </div>

      {/* 3. Menu List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        <MenuItem 
            icon={User} 
            title="اطلاعات شخصی" 
            subtitle="نام، شماره تماس، ایمیل"
            to="/profile/info" 
            color="text-blue-500"
        />
        <MenuItem 
            icon={MapPin} 
            title="آدرس‌های من" 
            subtitle="مدیریت محل‌های دریافت"
            to="/profile/addresses" 
            color="text-emerald-500"
        />
        <MenuItem 
            icon={ShoppingBag} 
            title="سوابق سفارش" 
            subtitle="پیگیری و مشاهده فاکتورها"
            to="/profile/orders" 
            color="text-purple-500"
        />
        <MenuItem 
            icon={ShieldCheck} 
            title="امنیت و رمز عبور" 
            subtitle="تغییر رمز ورود"
            to="/profile/security" 
            color="text-gray-500"
        />
      </div>

      {/* 4. Logout Button */}
      <button 
        onClick={logout}
        className="mt-6 w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-95"
      >
        <LogOut size={20} />
        خروج از حساب کاربری
      </button>

    </div>
  );
};

// کامپوننت کمکی آیتم منو
const MenuItem = ({ icon: Icon, title, subtitle, to, color }) => (
  <Link to={to} className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors group">
    <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl ${color.replace('text', 'bg')}/10 flex items-center justify-center ${color}`}>
            <Icon size={20} />
        </div>
        <div>
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
    </div>
    <ChevronLeft className="text-gray-300 group-hover:-translate-x-1 transition-transform" size={20} />
  </Link>
);

export default ProfileDashboard;