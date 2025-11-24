import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  // اگر تمام صفحه باشد، پوزیشن فیکس و پس‌زمینه شیشه‌ای می‌گیرد
  // اگر نباشد، فقط مرکز کانتینر والد قرار می‌گیرد
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-md transition-all duration-300"
    : "flex justify-center items-center w-full h-full min-h-[120px]";

  return (
    <div className={wrapperClass}>
      <div className="relative flex items-center justify-center scale-90 md:scale-100">
        
        {/* لایه ۱: حلقه بیرونی (آرام و با رنگ اصلی) */}
        <div className="absolute w-16 h-16 rounded-full border-[3px] border-[#0f172a]/10 border-t-[#0f172a] animate-[spin_2s_linear_infinite]" />
        
        {/* لایه ۲: حلقه میانی (سریع‌تر و معکوس با رنگ زرد) */}
        <div className="absolute w-10 h-10 rounded-full border-[3px] border-transparent border-b-[#facc15] animate-[spin_1.5s_linear_infinite_reverse] shadow-[0_0_10px_rgba(250,204,21,0.4)]" />

        {/* لایه ۳: نقطه مرکزی (تپنده) */}
        <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-[#0f172a] rounded-full animate-ping absolute opacity-75"></div>
            <div className="w-2 h-2 bg-[#0f172a] rounded-full relative"></div>
        </div>

        {/* متن لودینگ (اختیاری - فقط در حالت فول اسکرین نمایش داده شود بهتر است) */}
        {fullScreen && (
            <span className="absolute -bottom-10 text-xs font-bold tracking-widest text-[#0f172a] animate-pulse">
                LOADING...
            </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;