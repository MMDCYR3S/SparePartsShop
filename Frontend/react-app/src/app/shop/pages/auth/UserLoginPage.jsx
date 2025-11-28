import React, { useState } from "react";
import { useShopAuth } from "../../../../context/ShopAuthContext"; // مسیر را چک کنید
import { useNavigate } from "react-router-dom";

const UserLoginPage = () => {
  const { login } = useShopAuth(); // استفاده از کانتکست
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate("/");
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">ورود به حساب کاربری</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-light transition shadow-md hover:shadow-lg">
          ورود
        </button>
      </form>
    </div>
  );
};

export default UserLoginPage;