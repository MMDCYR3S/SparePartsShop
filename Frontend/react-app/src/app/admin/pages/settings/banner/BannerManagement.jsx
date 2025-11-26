// src/app/admin/pages/settings/banners/BannerManagement.jsx
import React, { useState, useEffect } from "react";
import { getBanners, createBanner, deleteBanner, updateBanner } from "@/app/admin/api/BannerApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  PhotoIcon, TrashIcon, ArrowPathIcon, CloudArrowUpIcon, 
  CheckIcon 
} from "@heroicons/react/24/outline";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // استیت فرم آپلود
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [newBannerOrder, setNewBannerOrder] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);

  // استیت برای ترک کردن تغییرات اردر هر بنر (برای ادیت سریع)
  const [ordersState, setOrdersState] = useState({});

  // 1. دریافت بنرها
  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      // سورت کردن بر اساس order (اگر بکند سورت نکنه)
      const sorted = data.sort((a, b) => a.order - b.order);
      setBanners(sorted);
      
      // مقداردهی اولیه استیت‌های ویرایش اردر
      const initialOrders = {};
      sorted.forEach(b => initialOrders[b.id] = b.order);
      setOrdersState(initialOrders);

    } catch (err) {
      alert("خطا در دریافت بنرها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. هندلر انتخاب فایل
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBannerImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. آپلود بنر جدید
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newBannerImage) return alert("لطفاً یک تصویر انتخاب کنید.");

    setUploading(true);
    try {
      await createBanner({
        image: newBannerImage,
        order: newBannerOrder
      });
      
      // ریست فرم
      setNewBannerImage(null);
      setImagePreview(null);
      setNewBannerOrder(prev => prev + 1); // اردر بعدی رو یکی زیاد کن
      
      await fetchBanners();
    } catch (err) {
      alert("خطا در آپلود بنر.");
    } finally {
      setUploading(false);
    }
  };

  // 4. حذف بنر
  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این بنر اطمینان دارید؟")) return;
    try {
      await deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert("خطا در حذف بنر");
    }
  };

  // 5. آپدیت اردر (تکی)
  const handleUpdateOrder = async (id) => {
    const newOrder = ordersState[id];
    try {
      await updateBanner(id, { order: newOrder });
      // نمایش فیدبک کوچک (اختیاری)
      const btn = document.getElementById(`btn-save-${id}`);
      if(btn) {
          btn.classList.add("bg-green-500", "text-white");
          setTimeout(() => btn.classList.remove("bg-green-500", "text-white"), 1000);
      }
      fetchBanners(); // رفرش برای سورت شدن مجدد
    } catch (err) {
      alert("خطا در ویرایش اولویت");
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">مدیریت بنرها</h1>
        <p className="text-sm text-gray-500 mt-1">تصاویر اسلایدر صفحه اصلی را اینجا مدیریت کنید.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CloudArrowUpIcon className="w-5 h-5 text-primary" /> افزودن بنر جدید
        </h3>
        
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Image Input Area */}
            <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain z-10" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PhotoIcon className="w-10 h-10 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-gray-500 font-bold">برای انتخاب عکس کلیک کنید</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 2MB)</p>
                        </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    
                    {imagePreview && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <span className="text-white font-bold text-sm">تغییر عکس</span>
                        </div>
                    )}
                </label>
            </div>

            {/* Controls */}
            <div className="w-full md:w-72 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اولویت نمایش (Order)</label>
                    <input 
                        type="number" 
                        value={newBannerOrder}
                        onChange={(e) => setNewBannerOrder(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-mono text-center text-lg"
                    />
                    <p className="text-xs text-gray-400 mt-1">عدد کوچکتر اول نمایش داده می‌شود.</p>
                </div>

                <button 
                    type="submit" 
                    disabled={uploading || !newBannerImage}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all active:scale-95"
                >
                    {uploading ? <LoadingSpinner className="w-5 h-5 text-white" /> : <CloudArrowUpIcon className="w-5 h-5" />}
                    {uploading ? "در حال آپلود..." : "آپلود بنر"}
                </button>
            </div>
        </form>
      </div>

      {/* Banners Grid */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-gray-500" /> لیست بنرهای فعال ({banners.length})
        </h3>
        
        {banners.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                هنوز بنری آپلود نشده است.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                        
                        {/* Image */}
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            <img 
                                src={banner.image || banner.image_url} 
                                alt={`Banner ${banner.id}`} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                ID: {banner.id}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex items-end gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">اولویت</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={ordersState[banner.id] || 0}
                                        onChange={(e) => setOrdersState({ ...ordersState, [banner.id]: e.target.value })}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-mono text-sm focus:ring-1 focus:ring-accent outline-none"
                                    />
                                    <button 
                                        id={`btn-save-${banner.id}`}
                                        onClick={() => handleUpdateOrder(banner.id)}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="ذخیره اولویت جدید"
                                    >
                                        <CheckIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleDelete(banner.id)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors mb-0.5"
                                title="حذف بنر"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default BannerManagement;