// src/app/admin/api/authApi.js
import axios from "axios";
import BASE_API from "../../BASE_API";

// ورود ادمین
export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post(BASE_API + "/accounts/login/", {
      username,
      password,
    });
    // سرور توکن access و refresh رو برمی‌گردونه
    return response.data;
  } catch (error) {
    console.error("Admin login failed:", error);
    // اگه سرور خطا داد (مثلا رمز اشتباه)، اون رو به کامپوننت منتقل می‌کنیم
    throw error;
  }
};

// خروج ادمین
export const adminLogout = async (refreshToken) => {
  try {
    // معمولاً برای خروج، توکن refresh رو به سرور می‌فرستیم تا باطل بشه
    await axios.post(BASE_API + "/accounts/logout/", {
      refresh: refreshToken,
    });
    return { success: true };
  } catch (error) {
    console.error("Admin logout failed:", error);
    throw error;
  }
};

// تازه‌سازی توکن access
export const refreshToken = async (refresh) => {
  try {
    const response = await axios.post(BASE_API + "/accounts/token/refresh/", {
      refresh,
    });
    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};