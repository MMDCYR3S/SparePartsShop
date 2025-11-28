// src/app/shop/api/CustomerApi.js

import shopAxios from "@/api/shopAxios";
import { handleApiError } from "@/utils/errorHandler";
import { objectToFormData } from "@/utils/httpUtils";

/**
 * Customer Data Layer (Repository)
 * تمام تعاملات با API های داشبورد مشتری در اینجا مدیریت می‌شود.
 */
export const CustomerApi = {

  // ============================================================
  // 👤 Profile Management
  // ============================================================

  /**
   * دریافت اطلاعات پروفایل کاربر
   * GET /dashboard/customer/profile/
   */
  getProfile: async () => {
    try {
      const response = await shopAxios.get("dashboard/customer/profile/");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * ویرایش پروفایل کاربر (شامل عکس)
   * PATCH /dashboard/customer/profile/
   * نکته: چون عکس داریم، از objectToFormData استفاده می‌کنیم.
   */
  updateProfile: async (profileData) => {
    try {
      // تبدیل JSON به FormData برای پشتیبانی از فایل
      const formData = objectToFormData(profileData);
      
      const response = await shopAxios.patch("dashboard/customer/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============================================================
  // 📍 Address Management
  // ============================================================

  /**
   * دریافت لیست آدرس‌ها
   * GET /dashboard/customer/addresses/
   */
  getAddresses: async () => {
    try {
      const response = await shopAxios.get("dashboard/customer/addresses/");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * ایجاد آدرس جدید
   * POST /dashboard/customer/addresses/
   */
  createAddress: async (addressData) => {
    try {
      const response = await shopAxios.post("dashboard/customer/addresses/", addressData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * ویرایش آدرس
   * PATCH /dashboard/customer/addresses/{id}/
   */
  updateAddress: async (id, addressData) => {
    try {
      const response = await shopAxios.patch(`dashboard/customer/addresses/${id}/`, addressData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * حذف آدرس
   * DELETE /dashboard/customer/addresses/{id}/
   */
  deleteAddress: async (id) => {
    try {
      await shopAxios.delete(`dashboard/customer/addresses/${id}/`);
      return { success: true, id };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============================================================
  // 🛍️ Order History
  // ============================================================

  /**
   * دریافت تاریخچه سفارشات کاربر
   * GET /dashboard/customer/profile/order/
   */
  getOrders: async () => {
    try {
      const response = await shopAxios.get("dashboard/customer/profile/order/");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============================================================
  // 🔐 Password & Security
  // ============================================================

  /**
   * درخواست لینک بازیابی رمز عبور
   * POST /dashboard/customer/password-reset/
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await shopAxios.post("dashboard/customer/password-reset/", { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * تایید و ست کردن رمز عبور جدید
   * POST /dashboard/customer/password-reset-confirm/
   */
  confirmPasswordReset: async (data) => {
    // data: { uid, token, new_password, new_password_confirm }
    try {
      const response = await shopAxios.post("dashboard/customer/password-reset-confirm/", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};