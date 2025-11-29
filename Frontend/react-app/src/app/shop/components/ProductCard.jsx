import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { PlusIcon, EyeIcon } from "@heroicons/react/24/outline";
import { ShoppingBag } from "lucide-react"; // استفاده از Lucide برای آیکون‌های مدرن‌تر
import BASE_API from "@/app/BASE_API";

// --- Logic Layer (Custom Hook) ---
// این هوک مسئول تمام منطق‌های کارت محصول است
const useProductCard = (product) => {
  const { addToCart, isUpdating } = useCart();
  const [imgError, setImgError] = useState(false);

  const getProductImage = () => {
    let img = product.main_image || product.image;
    if (!img && product.images?.length > 0) {
      img = product.images[0].image || product.images[0].image_url;
    }
    if (!img) return null;
    if (img.startsWith("http")) return img;
    const baseUrl = BASE_API.endsWith("/api/v1/") ? BASE_API.replace("/api/v1/", "") : BASE_API;
    return `${baseUrl}${img.startsWith("/") ? img.substring(1) : img}`;
  };

  const finalImage = getProductImage();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return { finalImage, imgError, setImgError, handleAddToCart, isUpdating };
};

// --- UI Layer (Pure Component) ---
const ProductCard = ({ product }) => {
  const { finalImage, imgError, setImgError, handleAddToCart, isUpdating } = useProductCard(product);

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group relative bg-white rounded-[2rem] p-3 border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-gray-200 flex flex-col h-full overflow-hidden"
    >
      {/* 1. Image Area with Action Overlay */}
      <div className="relative w-full aspect-square bg-surface rounded-[1.5rem] overflow-hidden mb-4">
        {/* Badge: Stock or Discount */}
        {!product.is_stock && (
             <div className="absolute top-3 left-3 z-20 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/20">
                ناموجود
             </div>
        )}
        
        {/* Image */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-700 group-hover:scale-110">
          {finalImage && !imgError ? (
            <img 
              src={finalImage} 
              alt={product.name} 
              onError={() => setImgError(true)}
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" 
              loading="lazy"
            />
          ) : (
            <div className="text-gray-300 flex flex-col items-center gap-2">
               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                 <ShoppingBag size={20} />
               </div>
            </div>
          )}
        </div>

        {/* Quick Action Overlay (Glassmorphism) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
           <button 
              onClick={handleAddToCart}
              disabled={!product.is_stock || isUpdating}
              className="w-full h-10 bg-primary/90 backdrop-blur-md text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
           >
              {isUpdating ? "..." : (product.is_stock ? "افزودن سریع" : "خبرم کن")}
              {product.is_stock && <PlusIcon className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="px-2 pb-2 flex flex-col flex-1">
        
        {/* Brand & Meta */}
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-bold text-accent-hover bg-accent/10 px-2 py-0.5 rounded-md uppercase tracking-wide">
             {product.brand || "عمومی"}
           </span>
           <span className="text-[10px] text-gray-400 font-mono tracking-wider">{product.part_code}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-primary leading-relaxed line-clamp-2 mb-3 flex-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-3">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">قیمت نهایی</span>
              <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-primary tracking-tight">
                    {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">تومان</span>
              </div>
           </div>
           
           {/* Mobile Only Add Button (Visible only on small screens) */}
           <div className="md:hidden w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary">
              <PlusIcon className="w-4 h-4" />
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;