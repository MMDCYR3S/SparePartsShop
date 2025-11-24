import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getProductById, 
  deleteProduct, 
  patchProduct, 
  bulkUpdateProductStatus 
} from '@/app/admin/api/ProductsApi';

// Icons
import { 
  ArrowRightIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TagIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  TruckIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '@/components/LoadingSpinner';

// ==================== کامپوننت نمایش خطا (مشترک) ====================
const ErrorBanner = ({ error, onRetry }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 animate-fade-in">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
      </div>
      <div className="mr-3 w-full">
        <h3 className="text-sm font-bold text-red-800">خطا در دریافت اطلاعات محصول</h3>
        <p className="mt-1 text-sm text-red-700">{error.userMessage}</p>
        <div className="mt-3 p-3 bg-red-100 rounded text-xs font-mono text-red-900 overflow-x-auto ltr" dir="ltr">
          <strong>Debug:</strong> {error.technicalMessage}
        </div>
        <button onClick={onRetry} className="mt-4 flex items-center text-sm font-medium text-red-700 hover:text-red-800">
          <ArrowPathIcon className="w-4 h-4 ml-1" /> تلاش مجدد
        </button>
      </div>
    </div>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==================== State ====================
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // specs, cars, desc

  // Editing States
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState('');

  // ==================== Fetch Data ====================
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id);
      setProduct(data);
      // پیدا کردن ایندکس عکس اصلی
      if (data.images && data.images.length > 0) {
        const mainIndex = data.images.findIndex(img => img.is_main);
        setSelectedImageIndex(mainIndex !== -1 ? mainIndex : 0);
      }
    } catch (err) {
      console.error(err);
      setError({
        userMessage: "محصول مورد نظر یافت نشد یا مشکلی در سرور وجود دارد.",
        technicalMessage: err.response ? `${err.response.status} - ${JSON.stringify(err.response.data)}` : err.message
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ==================== Handlers ====================

  const handleDelete = async () => {
    if (!window.confirm("آیا از حذف کامل این محصول مطمئن هستید؟")) return;
    try {
      await deleteProduct(id);
      navigate('/admin/products'); // بازگشت به لیست
    } catch (err) {
      alert("خطا در حذف محصول.");
    }
  };

  const handleToggleActive = async () => {
    try {
      // آپدیت سریع (Optimistic)
      const newStatus = !product.is_active;
      setProduct(prev => ({ ...prev, is_active: newStatus }));
      
      await bulkUpdateProductStatus([product.id], newStatus);
    } catch (err) {
      alert("خطا در تغییر وضعیت.");
      fetchProduct(); // Revert
    }
  };

  const handleToggleStock = async () => {
    try {
      const newStockStatus = !product.is_stock;
      setProduct(prev => ({ ...prev, is_stock: newStockStatus }));
      
      await patchProduct(product.id, { is_stock: newStockStatus });
    } catch (err) {
      alert("خطا در تغییر موجودی.");
      fetchProduct();
    }
  };

  // --- Price Inline Edit ---
  const handlePriceDoubleClick = () => {
    setTempPrice(product.price);
    setIsEditingPrice(true);
  };

  const handleSavePrice = async () => {
    if (!isEditingPrice) return;
    setIsEditingPrice(false);

    if (tempPrice == product.price) return; // تغییری نکرده

    try {
      setProduct(prev => ({ ...prev, price: tempPrice })); // Optimistic
      await patchProduct(id, { price: tempPrice });
    } catch (err) {
      alert("خطا در ذخیره قیمت.");
      fetchProduct();
    }
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') handleSavePrice();
    if (e.key === 'Escape') setIsEditingPrice(false);
  };

  // ==================== Render ====================

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-6"><ErrorBanner error={error} onRetry={fetchProduct} /></div>;
  if (!product) return null;

  const images = product.images || [];
  const currentImage = images.length > 0 ? images[selectedImageIndex] : null;

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
        >
          <ArrowRightIcon className="w-5 h-5" />
          بازگشت به لیست
        </button>

        <div className="flex gap-3">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm"
          >
            <TrashIcon className="w-5 h-5" />
            حذف محصول
          </button>
          <button 
            onClick={() => navigate(`/admin/products/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary-light rounded-xl transition-colors font-bold text-sm shadow-lg shadow-primary/20"
          >
            <PencilSquareIcon className="w-5 h-5" />
            ویرایش کامل
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. Left Column: Image Gallery (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 aspect-square flex items-center justify-center overflow-hidden relative group">
            {currentImage ? (
              <img 
                src={currentImage.image_url} 
                alt={product.name} 
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <PhotoIcon className="w-16 h-16" />
                <span className="text-sm">بدون تصویر</span>
              </div>
            )}
            {/* Badge for Main Image */}
            {currentImage?.is_main && (
              <span className="absolute top-4 right-4 bg-accent text-primary text-xs font-bold px-2 py-1 rounded shadow-md">
                تصویر اصلی
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${selectedImageIndex === idx ? 'border-accent shadow-md scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Right Column: Info & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{product.part_code || 'بدون کد فنی'}</span>
                  {product.category_name && (
                    <>
                      <span>•</span>
                      <span className="text-accent-hover font-medium">{product.category_name}</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                  {product.name}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">
                    <TagIcon className="w-3 h-3" /> {product.brand || 'برند نامشخص'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-bold">
                    <GlobeAmericasIcon className="w-3 h-3" /> {product.country_of_origin || 'کشور نامشخص'}
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-gray-50 p-4 rounded-xl text-center min-w-[180px] border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">قیمت مصرف کننده</span>
                <div onDoubleClick={handlePriceDoubleClick} className="cursor-pointer" title="دبل کلیک برای ویرایش">
                  {isEditingPrice ? (
                    <input 
                      type="number"
                      autoFocus
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onBlur={handleSavePrice}
                      onKeyDown={handlePriceKeyDown}
                      className="w-full text-center font-bold text-xl text-primary bg-white border border-accent rounded px-1 py-0.5 outline-none"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-2xl font-black text-primary hover:text-blue-600 transition-colors">
                      {parseInt(product.price).toLocaleString()}
                      <span className="text-xs font-medium text-gray-400">تومان</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* Quick Actions / Toggles */}
            <div className="flex flex-wrap gap-4">
              {/* Status Toggle */}
              <div 
                onClick={handleToggleActive}
                className={`flex-1 flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${product.is_active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${product.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    {product.is_active ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${product.is_active ? 'text-blue-800' : 'text-gray-600'}`}>
                      {product.is_active ? 'وضعیت: فعال' : 'وضعیت: غیرفعال'}
                    </p>
                    <p className="text-xs text-gray-500">قابل نمایش در فروشگاه</p>
                  </div>
                </div>
              </div>

              {/* Stock Toggle */}
              <div 
                onClick={handleToggleStock}
                className={`flex-1 flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${product.is_stock ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${product.is_stock ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                    <CubeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${product.is_stock ? 'text-emerald-800' : 'text-red-800'}`}>
                      {product.is_stock ? 'وضعیت: موجود' : 'وضعیت: ناموجود'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.stock_quantity > 0 ? `موجودی انبار: ${product.stock_quantity}` : 'اتمام موجودی'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('specs')} 
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'specs' ? 'border-accent text-primary bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                مشخصات فنی
              </button>
              <button 
                onClick={() => setActiveTab('cars')} 
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'cars' ? 'border-accent text-primary bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                خودروهای سازگار ({product.compatible_cars_info?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('desc')} 
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'desc' ? 'border-accent text-primary bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                توضیحات تکمیلی
              </button>
            </div>

            <div className="p-6 min-h-[200px]">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <DetailRow label="کد فنی قطعه" value={product.part_code} />
                  <DetailRow label="برند / سازنده" value={product.brand} />
                  <DetailRow label="کشور سازنده" value={product.country_of_origin} />
                  <DetailRow label="گارانتی" value={product.warranty} icon={<ShieldCheckIcon className="w-4 h-4 text-emerald-500" />} />
                  <DetailRow label="تعداد در بسته" value={product.package_quantity} />
                  <DetailRow label="اسلاگ (Slug)" value={product.slug} className="font-mono text-xs" />
                </div>
              )}

              {activeTab === 'cars' && (
                <div>
                   {product.compatible_cars_info && product.compatible_cars_info.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {product.compatible_cars_info.map(car => (
                         <div key={car.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                           <div className="bg-white p-2 rounded-full shadow-sm text-gray-400">
                             <TruckIcon className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-bold text-gray-800">{car.make} {car.model}</p>
                             <p className="text-xs text-gray-500">مدل سال: {car.year}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center text-gray-400 py-8">
                       <TruckIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                       <p>هیچ خودروی سازگاری تعیین نشده است.</p>
                     </div>
                   )}
                </div>
              )}

              {activeTab === 'desc' && (
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  {product.description ? (
                    product.description.split('\n').map((line, i) => <p key={i}>{line}</p>)
                  ) : (
                    <p className="text-gray-400 italic">توضیحاتی ثبت نشده است.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// کامپوننت کوچک برای نمایش ردیف‌های مشخصات
const DetailRow = ({ label, value, icon, className = '' }) => (
  <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
    <span className="text-gray-500 text-sm flex items-center gap-2">
      {icon} {label}
    </span>
    <span className={`font-medium text-gray-800 text-sm ${className}`}>
      {value || '---'}
    </span>
  </div>
);

export default ProductDetail;