// src/api/apiClient.js
import axios from "axios";
import BASE_API from "../app/BASE_API";

// یک نمونه (instance) جدید و هوشمند از Axios می‌سازیم
const apiClient = axios.create({
  baseURL: BASE_API, // آدرس اصلی سرور رو اینجا تنظیم می‌کنیم
});

// اینجا جادو اتفاق میفته! یک "نگهبان" برای درخواست‌ها می‌سازیم
apiClient.interceptors.request.use(
  (config) => {
    // قبل از هر درخواست، این تابع اجرا میشه
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));

    // اگر توکن وجود داشت، اون رو به هدر Authorization اضافه کن
    if (authTokens && authTokens.access) {
      config.headers.Authorization = `Bearer ${authTokens.access}`;
    }
    
    return config;
  },
  (error) => {
    // اگر در تنظیم درخواست مشکلی پیش اومد، اون رو برگردون
    return Promise.reject(error);
  }
);

export default apiClient;