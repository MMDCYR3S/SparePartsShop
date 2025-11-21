// src/app/admin/api/CategoriesApi.jsx
import apiClient from "@/api/apiClient";

// ==================== عملیات خواندن (READ) ====================

// ۱. دریافت لیست دسته‌بندی‌ها
// قابلیت جستجو (search) و مرتب‌سازی (ordering) هم دارد
export const getCategories = async (params = {}) => {
  try {
    // params می‌تونه شامل { search: 'text', ordering: 'name' } باشه
    const response = await apiClient.get("dashboard/admin/categories/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// ۲. دریافت یک دسته‌بندی خاص
export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`dashboard/admin/categories/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

// ==================== عملیات نوشتن (CREATE/UPDATE) ====================

// ۳. ایجاد دسته‌بندی جدید
// بدنه: { name: "string", parent: 0 (optional) }
export const createCategory = async (data) => {
  try {
    const response = await apiClient.post("dashboard/admin/categories/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// ۴. ویرایش کامل (PUT)
export const updateCategory = async (id, data) => {
  try {
    const response = await apiClient.put(`dashboard/admin/categories/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

// ۵. ویرایش جزئی (PATCH)
export const patchCategory = async (id, data) => {
  try {
    const response = await apiClient.patch(`dashboard/admin/categories/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error patching category ${id}:`, error);
    throw error;
  }
};

// ==================== عملیات حذف (DELETE) ====================

// ۶. حذف تکی
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/categories/${id}/`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

// ۷. حذف گروهی
// بدنه: { ids: [1, 2, 3] }
export const bulkDeleteCategories = async (ids) => {
  try {
    await apiClient.delete("dashboard/admin/categories/bulk-delete/", {
      data: { ids },
    });
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    throw error;
  }
};