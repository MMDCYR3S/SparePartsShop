import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "@/context/CartContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import BASE_API from "@/app/BASE_API";
import { 
  ChevronRightIcon, ShoppingCartIcon, CheckCircleIcon, XCircleIcon, 
  InformationCircleIcon, ShareIcon
} from "@heroicons/react/24/outline";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductDetail } = useProducts();
  const { addToCart, isUpdating } = useCart();
  
  const [product, setProduct] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchProductDetail(id);
      setProduct(data);
      setLoading(false);
    };
    loadData();
  }, [id]);

  // تصویر ساز
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const domain = BASE_API.replace("/api/v1/", ""); 
    return `${domain}${url}`;
  };

  // بستن صفحه (شبیه بستن مودال)
  const handleBack = () => {
      navigate(-1);
  };

  if (loading || !product) return <div className="h-screen flex items-center justify-center bg-white"><LoadingSpinner /></div>;

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    // Main Container with Slide Animation
    <div className="fixed inset-0 z-50 bg-white animate-slide-up-ios overflow-y-auto pb-32">
      
      {/* 1. Header Transparent (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 pt-safe">
        <button 
            onClick={handleBack} 
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition active:scale-90"
        >
            <ChevronRightIcon className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition active:scale-90">
            <ShareIcon className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* 2. Image Slider Section */}
      <div className="w-full bg-gray-50 pt-20 pb-10 rounded-b-[2.5rem] shadow-inner relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white rounded-full blur-3xl opacity-60 pointer-events-none"></div>

         {/* Scrollable Images */}
         <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-center relative z-10">
            {images.length > 0 ? (
                images.map((img, idx) => (
                    <div key={img.id} className="w-full flex-shrink-0 snap-center flex justify-center px-8">
                        <div className="aspect-square w-[85%] max-w-sm relative">
                            <img 
                                src={getImageUrl(img.image)}
                                className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply" 
                                alt={product.name}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-300">تصویر موجود نیست</div>
            )}
         </div>

         {/* Pagination Dots */}
         {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
                {images.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeImgIndex === idx ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'}`} />
                ))}
            </div>
         )}
      </div>

      {/* 3. Content Body */}
      <div className="px-6 mt-6">
        
        {/* Brand Chip */}
        <div className="flex items-center justify-between mb-2">
            <span className="bg-primary/5 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {product.brand}
            </span>
            {product.part_code && (
                <span className="text-gray-400 text-xs font-mono">{product.part_code}</span>
            )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-6">
            {product.name}
        </h1>

        {/* --- PRICE & ACTION (Main Area) --- */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <span className="text-xs text-gray-400 block mb-1">قیمت نهایی</span>
                    <div className="flex items-center gap-1.5 text-primary">
                        <span className="text-3xl font-black tracking-tight">{Number(product.price).toLocaleString()}</span>
                        <span className="text-sm font-bold text-gray-500">تومان</span>
                    </div>
                </div>
                {/* Stock Status */}
                {product.is_stock ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <CheckCircleIcon className="w-4 h-4"/> موجود
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <XCircleIcon className="w-4 h-4"/> ناموجود
                    </div>
                )}
            </div>

            <button 
                onClick={() => addToCart(product.id)}
                disabled={!product.is_stock || isUpdating}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                    product.is_stock 
                    ? 'bg-primary text-white hover:bg-primary-light' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
            >
                {isUpdating ? <LoadingSpinner className="w-6 h-6 text-white/80" /> : <ShoppingCartIcon className="w-6 h-6" />}
                {product.is_stock ? 'افزودن به سبد خرید' : 'موجود شد خبرم کن'}
            </button>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-1">کشور سازنده</span>
                <span className="font-bold text-gray-800">{product.country_of_origin || '-'}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-1">گارانتی</span>
                <span className="font-bold text-gray-800">{product.warranty || 'ندارد'}</span>
            </div>
        </div>

        {/* Description */}
        {product.description && (
            <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <InformationCircleIcon className="w-6 h-6 text-accent"/> درباره محصول
                </h3>
                <p className="text-sm text-gray-600 leading-7 text-justify whitespace-pre-line bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                    {product.description}
                </p>
            </div>
        )}

        {/* Cars */}
        {product.compatible_cars?.length > 0 && (
            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3">خودروهای سازگار</h3>
                <div className="flex flex-wrap gap-2">
                    {product.compatible_cars.map(car => (
                        <span key={car.id} className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            {car.make} {car.model}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;