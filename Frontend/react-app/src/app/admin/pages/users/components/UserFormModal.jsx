// src/app/admin/pages/users/components/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

const UserFormModal = ({ isOpen, onClose, userToEdit, onSubmit }) => {
  const isEditMode = !!userToEdit;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // نگهداری ارورهای سمت سرور (مثلاً: { username: ["این نام کاربری تکراری است"] })
  const [serverErrors, setServerErrors] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    is_staff: false,
    is_active: true,
    is_superuser: false,
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    setServerErrors({}); // ریست ارورها موقع باز شدن
    if (userToEdit) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "", 
        first_name: userToEdit.first_name || "",
        last_name: userToEdit.last_name || "",
        phone: userToEdit.phone || "",
        is_staff: userToEdit.is_staff || false,
        is_active: userToEdit.is_active ?? true,
        is_superuser: userToEdit.is_superuser || false,
      });
      setPhotoPreview(userToEdit.photo);
    } else {
      setFormData({
        username: "", email: "", password: "", first_name: "", last_name: "", phone: "",
        is_staff: false, is_active: true, is_superuser: false,
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // وقتی کاربر تایپ میکنه، ارور اون فیلد رو پاک کن
    if (serverErrors[name]) {
      setServerErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerErrors({});

    try {
      const payload = { ...formData };
      
      // اگر عکس جدید انتخاب شده، بفرست. اگر نه، کلاً از پی‌لود حذف کن (نفرستادن یعنی تغییر نکردن)
      if (photoFile) {
        payload.photo = photoFile;
      } else {
        delete payload.photo; 
      }
      
      // اگر پسورد خالیه و در حالت ویرایشیم، حذفش کن تا جنگو گیر نده
      if (isEditMode && !payload.password) {
        delete payload.password;
      }

      await onSubmit(payload);
      onClose();
    } catch (error) {
        console.error("Form Submit Error:", error);
        if (error.response && error.response.status === 400) {
            // ارورهای ولیدیشن جنگو رو میگیریم
            setServerErrors(error.response.data);
            
            // اگر ارور کلی (non_field_errors) داشتیم آلرت بده
            if (error.response.data.non_field_errors) {
                alert(error.response.data.non_field_errors.join("\n"));
            }
        } else {
            alert("خطای ناشناخته در سرور. لطفاً کنسول را چک کنید.");
        }
    } finally {
      setLoading(false);
    }
  };

  // کامپوننت کمکی برای نمایش ارور زیر اینپوت
  const ErrorMsg = ({ field }) => {
      if (!serverErrors[field]) return null;
      // ارورهای جنگو آرایه هستند
      return (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ExclamationCircleIcon className="w-3 h-3" />
              {Array.isArray(serverErrors[field]) ? serverErrors[field][0] : serverErrors[field]}
          </p>
      );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditMode ? "ویرایش کاربر" : "افزودن کاربر جدید"}
          </h3>
          <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-red-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            
            <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer w-24 h-24">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${serverErrors.photo ? 'border-red-500' : 'border-gray-300'} bg-gray-50 flex items-center justify-center group-hover:border-accent transition-colors`}>
                        {photoPreview ? (
                            <img src={photoPreview} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <PhotoIcon className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                        تغییر عکس
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                <ErrorMsg field="photo" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">نام کاربری *</label>
                    <input name="username" value={formData.username} onChange={handleChange} required className={`input-field w-full ${serverErrors.username ? 'border-red-500 bg-red-50' : ''}`} dir="ltr" />
                    <ErrorMsg field="username" />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ایمیل *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`input-field w-full ${serverErrors.email ? 'border-red-500 bg-red-50' : ''}`} dir="ltr" />
                    <ErrorMsg field="email" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        {isEditMode ? "رمز عبور (خالی = بدون تغییر)" : "رمز عبور *"}
                    </label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required={!isEditMode} 
                            className={`input-field w-full pl-10 ${serverErrors.password ? 'border-red-500 bg-red-50' : ''}`} 
                            dir="ltr" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-2.5 text-gray-400">
                            {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <ErrorMsg field="password" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">شماره موبایل</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className={`input-field w-full ${serverErrors.phone ? 'border-red-500 bg-red-50' : ''}`} dir="ltr" />
                    <ErrorMsg field="phone" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">نام</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="input-field w-full" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">نام خانوادگی</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="input-field w-full" />
                </div>
            </div>

            <div className="border-t pt-4 mt-2">
                <p className="text-sm font-bold text-gray-500 mb-3">دسترسی‌ها</p>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 text-accent rounded" />
                        <span className="text-sm">وضعیت فعال</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-blue-800">دسترسی ادمین (Staff)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                        <input type="checkbox" name="is_superuser" checked={formData.is_superuser} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded" />
                        <span className="text-sm text-purple-800">مدیر کل (Superuser)</span>
                    </label>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-bold">انصراف</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-light font-bold shadow-lg shadow-primary/20 flex justify-center items-center gap-2">
                    {loading && <LoadingSpinner className="w-5 h-5" />}
                    {isEditMode ? "ذخیره تغییرات" : "ایجاد کاربر"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;