import React from "react";
import { Link } from "react-router-dom";
import { useHome } from "../hooks/useHome";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ChevronLeftIcon, PhoneIcon, MapPinIcon, PhotoIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import BASE_API from "@/app/BASE_API";

const HomePage = () => {
  const { banners, newestProducts, loading, errors } = useHome();

  // تابع کمکی برای آدرس عکس
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const cleanBase = BASE_API.replace("/api/v1", "").replace("/api/v1/", ""); 
    return `${cleanBase}${url.startsWith("/") ? url.substring(1) : url}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="pb-32 animate-fade-in-up space-y-8">
      
      {/* 1. Welcome Message */}
      <div className="px-4 pt-4">
        <h1 className="text-lg font-black text-gray-800 leading-tight">
          خوش آمدید به سامانه <br/>
          <span className="text-primary text-xl">سفارش‌گیری آرمان یدک</span>
        </h1>
      </div>

      {/* 2. Banner Slider */}
      <div className="relative w-full min-h-[200px]"> 
        {banners.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-4 pb-4" style={{ scrollBehavior: "smooth" }}>
            {banners.map((banner, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center aspect-[16/9] rounded-2xl overflow-hidden shadow-lg shadow-primary/10 relative group bg-gray-200">
                <img 
                  src={getImageUrl(banner.image)} 
                  alt="Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-4 h-48 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
             {errors.banners ? <span className="text-red-400 text-xs">خطا در بارگذاری بنرها</span> : <span className="text-xs">بنری موجود نیست</span>}
          </div>
        )}
      </div>

      {/* 3. New Arrivals Slider */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-accent rounded-full"></div>
            جدیدترین محصولات
          </h2>
          <Link to="/products" className="text-xs font-bold text-primary flex items-center gap-1">
            مشاهده همه <ChevronLeftIcon className="w-3 h-3" />
          </Link>
        </div>
        
        {errors.products ? (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 flex items-center gap-2 text-sm">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>مشکل در ارتباط با سرور محصولات (Error 500)</span>
            </div>
        ) : newestProducts.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x">
                {newestProducts.map((product) => (
                    <div key={product.id} className="w-[160px] flex-shrink-0 snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
                <Link to="/products" className="w-[100px] flex-shrink-0 snap-start flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-2 border-dashed border-gray-200 text-gray-400 hover:border-accent hover:text-accent transition-colors gap-2">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span className="text-xs font-bold">بیشتر...</span>
                </Link>
            </div>
        ) : (
            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl">
                محصولی یافت نشد
            </div>
        )}
      </div>

      {/* 4. Branding Section (همیشه نمایش داده شود) */}
      <div className="mx-4 bg-[#0f172a] rounded-[2rem] p-6 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
         <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl font-black mb-1">آرمان یدڪ</h2>
            <p className="text-accent text-xs font-bold tracking-widest opacity-90">ARMAN YADAK</p>
            <p className="text-gray-400 text-[10px] mt-2 font-medium">تهیه و عرضه قطعات خودرو سواری - پخش عمده</p>
         </div>

         <div className="space-y-3 relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            {["نمایندگی رسمی فروش محصولات پاسیکو", "نمایندگی رسمی قطعات مارک فال صنعت", "نمایندگی قطعات مارک نراق قطعه", "دیسک و صفحه و کمک فنرهای عظام", "نمایندگی رسمی فرانڪو"].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                    <CheckBadgeIcon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-200 leading-relaxed">{item}</span>
                </div>
            ))}
         </div>

         <div className="mt-6 flex gap-3 relative z-10">
            <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 border border-white/5">
                <MapPinIcon className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-bold">مریوان</span>
            </div>
            <a href="https://wa.me/989189852876" className="flex-[2] bg-green-600 hover:bg-green-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20">
                <PhoneIcon className="w-6 h-6" />
                <div className="flex flex-col items-start">
                    <span className="text-[10px] opacity-80">ارتباط در واتس‌اپ</span>
                    <span className="text-sm font-bold font-mono tracking-wider">0918 985 2876</span>
                </div>
            </a>
         </div>
      </div>
    </div>
  );
};

export default HomePage;