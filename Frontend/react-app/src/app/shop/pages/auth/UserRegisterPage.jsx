import React, { useState } from "react";
import { useShopAuth } from "../../../../context/ShopAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";

const UserRegisterPage = () => {
  const { register } = useShopAuth();
  const navigate = useNavigate();

  // State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // خطای کلی
  const [fieldErrors, setFieldErrors] = useState({}); // خطاهای فیلد به فیلد (اگر نیاز به اعتبارسنجی لوکال بود)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // پاک کردن ارور وقتی کاربر تایپ می‌کند
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. اعتبارسنجی سمت کلاینت (ساده)
    if (formData.password !== formData.password_confirm) {
        setError("رمز عبور و تکرار آن مطابقت ندارند.");
        setLoading(false);
        return;
    }

    // 2. ارسال به سرور
    const result = await register(formData);

    if (result.success) {
      // موفقیت
      alert("ثبت نام با موفقیت انجام شد! لطفاً وارد شوید.");
      navigate("/login");
    } else {
      // نمایش خطا
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full text-primary mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-primary">
            ایجاد حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            به خانواده بزرگ ما بپیوندید
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-md flex items-center gap-3 animate-pulse">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام کاربری
              </label>
              <input
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent focus:z-10 sm:text-sm transition-all"
                placeholder="نام کاربری دلخواه (انگلیسی)"
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل
              </label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent focus:z-10 sm:text-sm transition-all"
                placeholder="your@email.com"
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز عبور
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                  placeholder="******"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تکرار رمز عبور
                </label>
                <input
                  name="password_confirm"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm transition-all"
                  placeholder="******"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20}/> در حال پردازش...
                </span>
              ) : (
                "ثبت نام"
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            قبلاً ثبت نام کرده‌اید؟{" "}
            <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
              وارد شوید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegisterPage;