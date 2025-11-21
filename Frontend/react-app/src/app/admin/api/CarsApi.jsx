// src/app/admin/api/CarsApi.jsx
import apiClient from "../../../api/apiClient";

// ==================== عملیات خواندن (READ) ====================

// ۱. دریافت لیست تمام ماشین‌ها
export const getCars = async () => {
  try {
    const response = await apiClient.get("dashboard/admin/cars/");
    return response.data;
  } catch (error) {
    console.error("Error fetching cars data:", error);
    throw error; // خطا رو به کامپوننت می‌فرستیم تا مدیریتش کنه
  }
};

// ۲. دریافت اطلاعات یک ماشین با شناسه (id)
export const getCarById = async (id) => {
  try {
    const response = await apiClient.get(`dashboard/admin/cars/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching car with id ${id}:`, error);
    throw error;
  }
};

// ==================== عملیات نوشتن (CREATE) ====================

// ۳. ساخت یک ماشین جدید
// ورودی: اطلاعات ماشین جدید (مثلاً {name: 'پراید', model: '۱۴۰۲'})
export const createCar = async (carData) => {
  try {
    const response = await apiClient.post("dashboard/admin/cars/", carData);
    return response.data; // سرور معمولاً اطلاعات ماشین ساخته شده رو برمی‌گردونه
  } catch (error) {
    console.error("Error creating new car:", error);
    throw error;
  }
};

// ==================== عملیات ویرایش (UPDATE) ====================

// ۴. ویرایش کامل یک ماشین (PUT)
// تمام فیلدها باید ارسال بشن، حتی اون‌هایی که تغییر نکردن
export const updateCar = async (id, carData) => {
  try {
    const response = await apiClient.put(`dashboard/admin/cars/${id}/`, carData);
    return response.data;
  } catch (error) {
    console.error(`Error updating car with id ${id}:`, error);
    throw error;
  }
};

// ۵. ویرایش جزئی یک ماشین (PATCH)
// فقط فیلدهایی که تغییر کرده‌اند ارسال میشن
export const patchCar = async (id, carData) => {
  try {
    const response = await apiClient.patch(`dashboard/admin/cars/${id}/`, carData);
    return response.data;
  } catch (error) {
    console.error(`Error patching car with id ${id}:`, error);
    throw error;
  }
};

// ==================== عملیات حذف (DELETE) ====================

// ۶. حذف یک ماشین
export const deleteCar = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/cars/${id}/`);
    return { success: true }; // برای اینکه بدونیم عملیات موفق بود
  } catch (error) {
    console.error(`Error deleting car with id ${id}:`, error);
    throw error;
  }
};

// ۷. حذف گروهی چند ماشین
// ورودی: آرایه‌ای از شناسه‌ها (id ها) مثلاً [1, 5, 12]
export const bulkDeleteCars = async (ids) => {
  try {
    await apiClient.delete("dashboard/admin/cars/bulk-delete/", {
      data: { ids } // معمولاً آی‌دی‌ها توی بدنه درخواست به صورت یک آبجکت فرستاده میشن
    });
    return { success: true };
  } catch (error) {
    console.error("Error in bulk deleting cars:", error);
    throw error;
  }
};