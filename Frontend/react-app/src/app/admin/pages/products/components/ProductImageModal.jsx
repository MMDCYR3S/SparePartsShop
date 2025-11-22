import React, { useState } from "react";
import { addProductImage, deleteProductImages } from "@/app/admin/api/ProductsApi";
import { X, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

const ProductImageModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  if (!isOpen || !product) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", file); // نام فیلد باید طبق داکیومنت 'image' باشد
    formData.append("is_main", "false"); // یا true، بسته به لاجیک UI

    try {
      await addProductImage(product.id, formData);
      alert("تصویر با موفقیت آپلود شد");
      setFile(null);
      setPreview(null);
      onSuccess(); // رفرش لیست
      onClose();
    } catch (error) {
      console.error(error);
      alert("خطا در آپلود تصویر");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllImages = async () => {
    if (!confirm("آیا مطمئنید می‌خواهید تمام تصاویر این محصول را حذف کنید؟")) return;
    setLoading(true);
    try {
      await deleteProductImages(product.id);
      alert("تمام تصاویر حذف شدند");
      onSuccess();
      onClose();
    } catch (error) {
      alert("خطا در حذف تصاویر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeInUp">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
                <ImageIcon size={20} /> مدیریت تصاویر: {product.name}
            </h3>
            <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-6">
            
            {/* نمایش تصاویر فعلی (فقط خواندنی در این مودال چون حذف تکی نداریم فعلا) */}
            <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">تصاویر فعلی:</p>
                <div className="flex gap-2 overflow-x-auto p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 min-h-[80px] items-center">
                    {product.images && product.images.length > 0 ? (
                        product.images.map((img, idx) => (
                            <div key={img.id || idx} className="w-16 h-16 rounded border bg-white flex-shrink-0 relative overflow-hidden">
                                <img src={img.image || img.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400 w-full text-center">بدون تصویر</span>
                    )}
                </div>
                {product.images && product.images.length > 0 && (
                    <button 
                        onClick={handleDeleteAllImages}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                        <Trash2 size={12} /> حذف همه تصاویر
                    </button>
                )}
            </div>

            {/* بخش آپلود */}
            <div className="border-t pt-4">
                <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition relative group">
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    
                    {preview ? (
                        <div className="relative w-32 h-32 mx-auto">
                            <img src={preview} className="w-full h-full object-contain rounded-lg shadow-sm" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg text-white text-xs">
                                تغییر عکس
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-400">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm">کلیک کنید یا عکس را اینجا رها کنید</span>
                        </div>
                    )}
                </label>
            </div>

            <div className="mt-6 flex gap-3">
                <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">بستن</button>
                <button 
                    onClick={handleUpload} 
                    disabled={!file || loading}
                    className="flex-1 py-2 bg-slate-900 text-yellow-400 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    آپلود تصویر
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ProductImageModal;