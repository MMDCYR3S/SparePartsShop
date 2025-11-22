import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "@/app/admin/api/ProductsApi";
import { X, Save, Loader2 } from "lucide-react";

const ProductFormModal = ({ isOpen, onClose, productToEdit, onSuccess }) => {
  const isEditMode = !!productToEdit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial State based on API structure
  const [formData, setFormData] = useState({
    name: "",
    part_code: "",
    brand: "",
    country_of_origin: "",
    price: "",
    stock_quantity: 0,
    package_quantity: 1,
    description: "",
    warranty: "",
    allow_individual_sale: true,
    is_active: true,
    category: "", // Should be ID
    compatible_cars: [], // Should be array of IDs: [1, 2]
  });

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        part_code: productToEdit.part_code || "",
        brand: productToEdit.brand || "",
        country_of_origin: productToEdit.country_of_origin || "",
        price: productToEdit.price || "",
        stock_quantity: productToEdit.stock_quantity || 0,
        package_quantity: productToEdit.package_quantity || 1,
        description: productToEdit.description || "",
        warranty: productToEdit.warranty || "",
        allow_individual_sale: productToEdit.allow_individual_sale ?? true,
        is_active: productToEdit.is_active ?? true,
        category: productToEdit.category || "",
        compatible_cars: productToEdit.compatible_cars || [], 
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // هندل کردن ورودی آرایه‌ای برای ماشین‌ها (فعلا به صورت متنی که با ویرگول جدا میشه)
  // در نسخه پیشرفته باید از یک کامپوننت MultiSelect استفاده کنی
  const handleCarsChange = (e) => {
      const val = e.target.value;
      // تبدیل استرینگ "1,2,3" به آرایه اعداد [1, 2, 3]
      const ids = val.split(',').map(item => parseInt(item.trim())).filter(num => !isNaN(num));
      setFormData(prev => ({ ...prev, compatible_cars: ids }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.part_code || !formData.category) {
        setError("لطفاً فیلدهای ستاره‌دار را تکمیل کنید.");
        setLoading(false);
        return;
    }

    try {
      if (isEditMode) {
        await updateProduct(productToEdit.id, formData);
        alert("محصول با موفقیت ویرایش شد");
      } else {
        await createProduct(formData);
        alert("محصول جدید ایجاد شد");
      }
      onSuccess(); // رفرش لیست والد
      onClose();
    } catch (err) {
      console.error(err);
      setError("خطا در ذخیره اطلاعات. لطفاً ورودی‌ها را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fadeInUp">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {isEditMode ? <EditIcon /> : <SaveIcon />}
            {isEditMode ? `ویرایش محصول: ${productToEdit.name}` : "افزودن محصول جدید"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Field: Name */}
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">نام محصول *</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full input-field" placeholder="مثال: لنت ترمز جلو پراید" required />
            </div>

            {/* Field: Part Code & Category */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">کد فنی *</label>
                <input name="part_code" value={formData.part_code} onChange={handleChange} className="w-full input-field font-mono" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">شناسه دسته‌بندی *</label>
                <input type="number" name="category" value={formData.category} onChange={handleChange} className="w-full input-field" placeholder="ID دسته‌بندی" required />
                <span className="text-xs text-slate-400">بعداً این را به Select Box تبدیل کن</span>
            </div>

            {/* Field: Price & Brand */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">قیمت (تومان) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full input-field" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">برند *</label>
                <input name="brand" value={formData.brand} onChange={handleChange} className="w-full input-field" required />
            </div>

            {/* Field: Stock & Origin */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">موجودی انبار</label>
                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full input-field" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">کشور سازنده *</label>
                <input name="country_of_origin" value={formData.country_of_origin} onChange={handleChange} className="w-full input-field" required />
            </div>
            
            {/* Field: Compatible Cars */}
             <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">شناسه خودروهای سازگار</label>
                <input 
                    type="text" 
                    value={formData.compatible_cars.join(',')} 
                    onChange={handleCarsChange} 
                    className="w-full input-field" 
                    placeholder="مثال: 1, 5, 12 (با کاما جدا کنید)" 
                />
            </div>

            {/* Description */}
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">توضیحات</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full input-field"></textarea>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="accent-slate-900 w-5 h-5" />
                    <span className="text-sm font-medium text-slate-700">وضعیت فعال</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="allow_individual_sale" checked={formData.allow_individual_sale} onChange={handleChange} className="accent-slate-900 w-5 h-5" />
                    <span className="text-sm font-medium text-slate-700">فروش تکی مجاز است</span>
                </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">انصراف</button>
            <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-yellow-400 rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:opacity-70"
            >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {isEditMode ? "ذخیره تغییرات" : "ایجاد محصول"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple Styles for inputs inside component
const SaveIcon = () => <Save size={18} />;
const EditIcon = () => <Edit size={18} className="mr-1" />;

export default ProductFormModal;