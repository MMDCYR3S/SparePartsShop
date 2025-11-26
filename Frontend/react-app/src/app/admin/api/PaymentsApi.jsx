// src/app/admin/api/PaymentsApi.jsx
import apiClient from "@/api/apiClient";

// دریافت لیست پرداخت‌ها (با سرچ و سورت)
export const getPayments = async (params = {}) => {
  try {
    const response = await apiClient.get("dashboard/admin/payments/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

// حذف تکی
export const deletePayment = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/payments/${id}/`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// حذف گروهی
export const bulkDeletePayments = async (ids) => {
  try {
    // طبق داکیومنت بدنه باید { ids: [...] } باشد
    await apiClient.delete("dashboard/admin/payments/bulk-delete/", {
      data: { ids },
    });
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// آپدیت وضعیت گروهی
export const bulkUpdatePaymentStatus = async (ids, status) => {
  try {
    // طبق داکیومنت: { "ids": [...], "status": "completed" }
    const response = await apiClient.patch("dashboard/admin/payments/bulk-update-status/", {
      ids,
      status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};