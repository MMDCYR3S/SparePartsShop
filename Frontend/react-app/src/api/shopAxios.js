import axios from "axios";
import BASE_API from "../app/BASE_API";

// آدرس بیس API
// const BASE_API = BASE_API;

const shopAxios = axios.create({
  baseURL: BASE_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// 1. Request Interceptor (تزریق توکن به هر درخواست)
// =========================================================
shopAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// 2. Response Interceptor (مدیریت انقضا و رفرش توکن)
// =========================================================
shopAxios.interceptors.response.use(
  (response) => response, // اگر همه چیز اوکی بود، پاسخ رو رد کن
  async (error) => {
    const originalRequest = error.config;

    // اگر ارور 401 بود و قبلاً یک بار سعی نکرده بودیم رفرش کنیم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // علامت می‌زنیم که وارد لوپ بی‌نهایت نشیم

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
            // اگر رفرش توکن هم نداشتیم، یعنی کاربر کلا لاگین نیست
            throw new Error("No refresh token");
        }

        // درخواست برای دریافت توکن جدید
        const response = await axios.post(`${BASE_API}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        // در برخی پیاده‌سازی‌ها رفرش توکن جدید هم برمی‌گردد، اینجا فرض بر این است فقط اکسس می‌آید
        
        // ذخیره توکن جدید
        localStorage.setItem("access_token", newAccessToken);

        // آپدیت کردن هدر درخواست قبلی که فیل شده بود
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // تکرار درخواست قبلی با توکن جدید
        return shopAxios(originalRequest);

      } catch (refreshError) {
        // اگر رفرش توکن هم منقضی شده بود یا ارور داد
        console.error("Session expired:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login"; // ریدایرکت اجباری به لاگین
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default shopAxios;