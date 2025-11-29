// src/app/shop/pages/profile/Security.jsx
import React, { useState } from "react";
import { useCustomer } from "@/app/shop/hooks/useCustomer";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Key, Mail, Loader2, CheckCircle } from "lucide-react";

const Security = () => {
  const { profile, requestReset, isSubmitting } = useCustomer();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleResetRequest = async () => {
    if (!profile?.email) return alert("ایمیل در پروفایل شما ثبت نشده است.");
    
    const result = await requestReset(profile.email);
    if (result.success) {
      setSent(true);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">امنیت حساب</h1>
      </div>

      <div className="space-y-4">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">وضعیت امنیتی: ایمن</h2>
            <p className="text-sm text-gray-500 mt-2">
                حساب کاربری شما با ایمیل <span className="font-mono text-gray-700 bg-gray-100 px-1 rounded">{profile?.email}</span> محافظت می‌شود.
            </p>
        </div>

        {/* Change Password Action */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <Key size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">تغییر رمز عبور</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        برای تغییر رمز عبور، ما یک لینک امن به ایمیل شما ارسال می‌کنیم.
                    </p>
                    
                    {sent ? (
                        <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-sm font-bold">
                            <CheckCircle size={18} />
                            لینک ارسال شد. ایمیل خود را چک کنید.
                        </div>
                    ) : (
                        <button 
                            onClick={handleResetRequest}
                            disabled={isSubmitting}
                            className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Mail size={18} />}
                            ارسال لینک تغییر رمز
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Security;