// src/app/admin/pages/login/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { adminLogin } from "../api/AuthApi";


const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // تابع login از AuthContext رو صدا می‌زنیم و بهش تابع adminLogin رو می‌دیم
      await login(username, password, adminLogin);
    } catch (err) {
      // اگه خطایی از سرور اومد (مثلا 401)، نمایش بده
      setError("نام کاربری یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-screen text-primary">
      <form
        onSubmit={handleSubmit}
        dir="rtl"
        className="grid grid-cols-1 gap-y-4 "
      >
        <h2>ورود ادمین</h2>
        <div>
          <label>نام کاربری:</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>رمز عبور:</label>

          <input
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading} className="text-surface bg-primary py-2">
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
