// src/app/shop/hooks/useCustomer.js

import { useState, useCallback } from "react";
import { CustomerApi } from "@/app/shop/api/CustomerApi";
import { handleApiError } from "@/utils/errorHandler"; // اگر ارور هندلر سراسری داری

export const useCustomer = () => {
  // ==================== States ====================
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // لودینگ‌های جداگانه برای UX بهتر
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // برای دکمه‌های فرم

  const [error, setError] = useState(null);

  // ==================== Actions: Profile ====================

  /**
   * دریافت اطلاعات پروفایل
   */
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const data = await CustomerApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError(err); // یا handleApiError(err)
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  /**
   * آپدیت پروفایل
   * @param {Object} data - آبجکت حاوی اطلاعات (می‌تونه شامل فایل عکس هم باشه)
   */
  const updateProfile = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedProfile = await CustomerApi.updateProfile(data);
      setProfile(updatedProfile); // آپدیت استیت داخلی با دیتای جدید سرور
      return { success: true, message: "پروفایل با موفقیت بروزرسانی شد." };
    } catch (err) {
      return { success: false, message: typeof err === 'string' ? err : "خطا در ویرایش پروفایل" };
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== Actions: Addresses ====================

  /**
   * دریافت لیست آدرس‌ها
   */
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const data = await CustomerApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
      // اینجا ارور رو ست نمی‌کنیم تا کل صفحه نپره، شاید فقط آدرس‌ها فچ نشن
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  /**
   * افزودن آدرس جدید
   */
  const addAddress = async (addressData) => {
    setIsSubmitting(true);
    try {
      const newAddress = await CustomerApi.createAddress(addressData);
      // اضافه کردن آدرس جدید به لیست فعلی (بدون رفرش دوباره)
      setAddresses((prev) => [...prev, newAddress]); 
      return { success: true, message: "آدرس جدید ثبت شد." };
    } catch (err) {
      return { success: false, message: "خطا در ثبت آدرس." };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ویرایش آدرس
   */
  const editAddress = async (id, addressData) => {
    setIsSubmitting(true);
    try {
      const updatedAddress = await CustomerApi.updateAddress(id, addressData);
      // جایگزین کردن آدرس آپدیت شده در لیست
      setAddresses((prev) => 
        prev.map((addr) => (addr.id === id ? updatedAddress : addr))
      );
      return { success: true, message: "آدرس ویرایش شد." };
    } catch (err) {
      return { success: false, message: "خطا در ویرایش آدرس." };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * حذف آدرس
   */
  const removeAddress = async (id) => {
    // اینجا لودینگ سراسری نمیذاریم، شاید بخوای روی دکمه حذف اسپینر بذاری
    // یا میتونی یک state جداگانه برای deletingId داشته باشی
    try {
      await CustomerApi.deleteAddress(id);
      // حذف از لیست لوکال
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      return { success: true, message: "آدرس حذف شد." };
    } catch (err) {
      return { success: false, message: "خطا در حذف آدرس." };
    }
  };

  // ==================== Actions: Orders ====================

  /**
   * دریافت لیست سفارشات
   */
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await CustomerApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // ==================== Password Reset ====================
  // نکته: این بخش معمولاً در صفحه لاگین/فراموشی رمز عبور استفاده میشه
  // اما چون جزو API کاستومر بود اینجا هم میاریمش
  
  const requestReset = async (email) => {
    setIsSubmitting(true);
    try {
      await CustomerApi.requestPasswordReset(email);
      return { success: true, message: "لینک بازیابی ارسال شد." };
    } catch (err) {
      return { success: false, message: "خطا در ارسال ایمیل." };
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmReset = async (data) => {
    setIsSubmitting(true);
    try {
      await CustomerApi.confirmPasswordReset(data);
      return { success: true, message: "رمز عبور با موفقیت تغییر کرد." };
    } catch (err) {
      return { success: false, message: "لینک منقضی شده یا اطلاعات نامعتبر است." };
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== Return Logic ====================
  
  return {
    // Data
    profile,
    addresses,
    orders,
    
    // Loading States
    loadingProfile,
    loadingAddresses,
    loadingOrders,
    isSubmitting,
    
    // Errors
    error,
    
    // Methods
    fetchProfile,
    updateProfile,
    
    fetchAddresses,
    addAddress,
    editAddress,
    removeAddress,
    
    fetchOrders,
    
    requestReset,
    confirmReset
  };
};