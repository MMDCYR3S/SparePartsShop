// src/app/admin/api/BannersApi.jsx
import apiClient from "@/api/apiClient";
import { objectToFormData } from "@/utils/httpUtils";

// دریافت لیست بنرها
export const getBanners = async () => {
  try {
    const response = await apiClient.get("dashboard/admin/banners/");
    return response.data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

// ایجاد بنر جدید (ارسال فایل)
export const createBanner = async (data) => {
  try {
    const formData = objectToFormData(data);
    const response = await apiClient.post("dashboard/admin/banners/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

// ویرایش بنر (مثلاً تغییر اولویت نمایش یا عکس)
export const updateBanner = async (id, data) => {
  try {
    // اگر فقط تغییر اردر باشد، نیازی به ارسال عکس نیست. 
    // تابع objectToFormData هوشمند است و فقط فیلدهای موجود را می‌فرستد.
    const formData = objectToFormData(data);
    const response = await apiClient.patch(`dashboard/admin/banners/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating banner ${id}:`, error);
    throw error;
  }
};

// حذف بنر
export const deleteBanner = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/banners/${id}/`);
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting banner ${id}:`, error);
    throw error;
  }
};