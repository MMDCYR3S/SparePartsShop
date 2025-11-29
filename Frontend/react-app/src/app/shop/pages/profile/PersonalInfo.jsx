// src/app/shop/pages/profile/PersonalInfo.jsx
import React, { useState, useEffect } from "react";
import { useCustomer } from "@/app/shop/hooks/useCustomer";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save, Loader2, Camera } from "lucide-react";

const PersonalInfo = () => {
  const { profile, fetchProfile, updateProfile, isSubmitting } = useCustomer();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", username: "", email: "", phone: "", landline: ""
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        landline: profile.landline || "",
      });
      setPhotoPreview(profile.photo);
    }
  }, [profile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ترکیب دیتا و فایل
    const dataToSend = { ...formData };
    if (photoFile) dataToSend.photo = photoFile;

    const result = await updateProfile(dataToSend);
    if (result.success) {
      alert("اطلاعات با موفقیت ذخیره شد");
      navigate(-1);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">اطلاعات شخصی</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Upload */}
        <div className="flex justify-center">
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                    <img src={photoPreview || "https://via.placeholder.com/150"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary-light transition-colors">
                    <Camera size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
        </div>

        {/* Inputs Grid */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نام</label>
                    <input 
                        type="text" 
                        value={formData.first_name}
                        onChange={e => setFormData({...formData, first_name: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-accent transition-all text-sm font-bold"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">نام خانوادگی</label>
                    <input 
                        type="text" 
                        value={formData.last_name}
                        onChange={e => setFormData({...formData, last_name: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-accent transition-all text-sm font-bold"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">شماره موبایل</label>
                <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-accent transition-all text-sm font-bold font-mono text-left"
                    dir="ltr"
                />
            </div>
            
            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">ایمیل</label>
                <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-accent transition-all text-sm font-bold font-mono text-left"
                    dir="ltr"
                />
            </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-accent rounded-2xl font-black text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                ذخیره تغییرات
            </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;