import axios from "axios";
import BASE_URL from "../app/BASE_API";

// بهتره آدرس رو از متغیر محیطی بخونی، ولی فعلا هاردکد اوکیه
// نکته: اگر فایل BASE_API داری، اون رو هم میتونی ایمپورت کنی
// const BASE_API = "http://127.0.0.1:8000/api/v1/";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor (تزریق توکن)
apiClient.interceptors.request.use(
  (config) => {
    // همیشه سعی کن از یک ثابت برای کلید لوکال‌استوریج استفاده کنی
    const tokensString = localStorage.getItem('authTokens');
    if (tokensString) {
      const tokens = JSON.parse(tokensString);
      if (tokens?.access) {
        config.headers.Authorization = `Bearer ${tokens.access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor (مدیریت خطای جهانی)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // اگر خطای 401 (عدم احراز هویت) داد
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error("نشست کاربری منقضی شده است.");
      
      // اینجا بعداً لاجیک رفرش توکن رو اضافه میکنیم
      // فعلاً یوزر رو لاگ‌اوت میکنیم
      localStorage.removeItem('authTokens');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;