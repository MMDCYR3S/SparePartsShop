// src/app/admin/api/UsersApi.jsx
import apiClient from "@/api/apiClient";
import { objectToFormData } from "@/utils/httpUtils";

// ==================== READ (دریافت اطلاعات) ====================

/**
 * دریافت لیست کاربران با قابلیت جستجو و صفحه‌بندی
 * Endpoint: GET /dashboard/admin/users/
 * @param {Object} params - { search, ordering, page }
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await apiClient.get("dashboard/admin/users/", { params });
    return response.data;
  } catch (error) {
    // اینجا خطا را لاگ می‌کنیم یا به فرمتی که برای UI لازم است تغییر می‌دهیم
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * دریافت جزئیات یک کاربر خاص (شامل سفارش‌ها و آدرس‌ها)
 * Endpoint: GET /dashboard/admin/users/{id}/
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`dashboard/admin/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

// ==================== WRITE (ساخت و ویرایش) ====================

/**
 * ایجاد کاربر جدید
 * نکته: چون عکس داریم، از FormData استفاده می‌کنیم.
 * Endpoint: POST /dashboard/admin/users/
 */
export const createUser = async (userData) => {
  try {
    const formData = objectToFormData(userData);
    
    const response = await apiClient.post("dashboard/admin/users/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * ویرایش کامل کاربر (PUT)
 * تمام فیلدها بازنویسی می‌شوند.
 * Endpoint: PUT /dashboard/admin/users/{id}/
 */
export const updateUser = async (id, userData) => {
  try {
    const formData = objectToFormData(userData);

    const response = await apiClient.put(`dashboard/admin/users/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * ویرایش جزئی کاربر (PATCH)
 * مثلاً فقط تغییر وضعیت فعال/غیرفعال یا تغییر رمز عبور.
 * Endpoint: PATCH /dashboard/admin/users/{id}/
 */
export const patchUser = async (id, partialData) => {
  try {
    // تشخیص می‌دهیم که آیا داده‌ها شامل فایل هستند یا خیر
    // اگر فایل باشد FormData، اگر نه JSON معمولی (معمولا JSON سریعتر و استانداردتر است برای پچ‌های ساده)
    // اما چون متد objectToFormData داریم، برای یکدستی از همان استفاده می‌کنیم مگر اینکه فقط JSON بخواهیم.
    // طبق داکیومنت، متد PATCH هم Multipart را ساپورت می‌کند.
    
    const formData = objectToFormData(partialData);

    const response = await apiClient.patch(`dashboard/admin/users/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error patching user ${id}:`, error);
    throw error;
  }
};

// ==================== DELETE (حذف) ====================

/**
 * حذف یک کاربر
 * Endpoint: DELETE /dashboard/admin/users/{id}/
 */
export const deleteUser = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/users/${id}/`);
    return { success: true, id };
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// ==================== BULK ACTIONS (عملیات گروهی) ====================

/**
 * حذف گروهی کاربران
 * Endpoint: DELETE /dashboard/admin/users/bulk-delete/
 * Body: { "ids": [1, 2, 3] }
 */
export const bulkDeleteUsers = async (ids) => {
  try {
    // در Axios برای متد DELETE، اگر بخواهیم Body بفرستیم باید داخل آپشن `data` باشد.
    await apiClient.delete("dashboard/admin/users/bulk-delete/", {
      data: { ids },
    });
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    throw error;
  }
};

/**
 * آپدیت گروهی کاربران
 * Endpoint: PATCH /dashboard/admin/users/bulk-update/
 * Body: [ { "id": 1, "is_active": false }, ... ]
 * نکته: معمولاً عملیات بالک به صورت JSON ارسال می‌شوند نه FormData (مگر اینکه داکیومنت خلافش را بگوید).
 * در داکیومنت شما Schema به صورت آرایه JSON آمده است.
 */
export const bulkUpdateUsers = async (usersList) => {
  try {
    const response = await apiClient.patch("dashboard/admin/users/bulk-update/", usersList);
    return response.data;
  } catch (error) {
    console.error("Error bulk updating users:", error);
    throw error;
  }
};