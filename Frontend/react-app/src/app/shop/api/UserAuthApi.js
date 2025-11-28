// src/app/shop/api/UserAuthApi.js
import shopAxios from "../../../api/shopAxios"; // آدرس‌دهی نسبی را چک کنید

export const UserAuthApi = {
  login: async (credentials) => {
    // نکته: دیگر /api/v1/ را تکرار نمی‌کنیم چون در BASE_API هست
    const response = await shopAxios.post("accounts/login/", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await shopAxios.post("accounts/register/", userData);
    return response.data;
  },

  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
        await shopAxios.post("accounts/logout/", { refresh });
    } catch (e) {
        console.warn("Logout error", e);
    }
  },
  
  // متد پروفایل (اختیاری برای تست توکن)
  getProfile: async () => {
    // فرض بر اینکه اندپوینتی برای پروفایل دارید، اگر ندارید فعلا کامنت کنید
    // const response = await shopAxios.get("accounts/profile/"); 
    // return response.data;
    return { message: "Profile Logic Here" };
  }
};