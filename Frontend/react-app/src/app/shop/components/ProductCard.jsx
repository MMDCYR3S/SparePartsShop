import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import BASE_API from "@/app/BASE_API";

const ProductCard = ({ product }) => {
  const { addToCart, isUpdating } = useCart();
  const [imgError, setImgError] = useState(false);

  // تابع هوشمند استخراج تصویر
  const getProductImage = (p) => {
    // 1. اولویت با تصویر اصلی
    let img = p.main_image || p.image;
    // 2. اگر نبود، اولین تصویر از لیست تصاویر
    if (!img && p.images && p.images.length > 0) {
      img = p.images[0].image || p.images[0].image_url;
    }
    
    if (!img) return null;
    if (img.startsWith("http")) return img;
    // حذف بخش تکراری احتمالی از BASE_API
    const baseUrl = BASE_API.endsWith("/api/v1/") ? BASE_API.replace("/api/v1/", "") : BASE_API;
    return `${baseUrl}${img.startsWith("/") ? img.substring(1) : img}`;
  };

  const finalImage = getProductImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="block group relative w-full"
    >
      <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98]">
        
        {/* 1. Image Container - STRICTLY SQUARE */}
        <div className="w-full aspect-square bg-gray-50/50 relative flex items-center justify-center p-6">
          {finalImage && !imgError ? (
            <img 
              src={finalImage} 
              alt={product.name} 
              onError={() => setImgError(true)}
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
              loading="lazy"
            />
          ) : (
            <div className="text-gray-300 flex flex-col items-center gap-1">
               <PhotoIcon className="w-8 h-8" />
            </div>
          )}

          {/* Stock Badge (Minimal) */}
          {!product.is_stock && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    ناموجود
                </span>
             </div>
          )}
        </div>

        {/* 2. Content */}
        <div className="p-4 flex flex-col gap-2">
          
          {/* Brand & Code */}
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
             <span className="uppercase tracking-wide">{product.brand || "متفرقه"}</span>
             {product.part_code && <span className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">{product.part_code}</span>}
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold text-gray-800 leading-relaxed line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>

          {/* Footer: Price & Add */}
          <div className="flex items-center justify-between mt-1">
             <div className="flex flex-col">
                <div className="flex items-baseline gap-1 text-primary">
                    <span className="text-sm font-black">{Number(product.price).toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 font-medium">تومان</span>
                </div>
             </div>

             <button 
                onClick={handleAddToCart}
                disabled={!product.is_stock || isUpdating}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90 ${
                    product.is_stock 
                    ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-light' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
             >
                <PlusIcon className="w-5 h-5 stroke-2" />
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;