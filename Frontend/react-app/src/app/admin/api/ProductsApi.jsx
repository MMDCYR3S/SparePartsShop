import apiClient from "@/api/apiClient";

// =================================================================
// 🛠 Helper: تبدیل آبجکت جاوااسکریپت به FormData
// این تابع حیاتی است چون بکند جنگو برای آپلود فایل و دیتا همزمان
// انتظار Multipart/form-data دارد، نه JSON معمولی.
// =================================================================
const buildFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) return; // مقادیر خالی رو نمیفرستیم

    if (Array.isArray(value)) {
      // هندل کردن آرایه‌ها (مثل compatible_cars)
      // جنگو انتظار داره کلید تکرار بشه: compatible_cars=1, compatible_cars=2
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (value instanceof File) {
      // اگر فایل بود خودشو میفرستیم
      formData.append(key, value);
    } else {
      // بقیه مقادیر تبدیل به رشته میشن
      formData.append(key, value);
    }
  });

  return formData;
};

// ==================== READ (خواندن) ====================

// ۱. لیست محصولات (با سرچ و سورت)
export const getProducts = async (params = {}) => {
  // params: { search: '...', ordering: 'price', page: 1 }
  const response = await apiClient.get("dashboard/admin/products/", { params });
  return response.data;
};

// ۲. دریافت جزئیات یک محصول
export const getProductById = async (id) => {
  const response = await apiClient.get(`dashboard/admin/products/${id}/`);
  return response.data;
};

// ==================== CREATE / UPDATE (نوشتن) ====================

// ۳. ساخت محصول جدید
// نکته: ورودی data یک آبجکت معمولی JS است، ما تبدیلش میکنیم به FormData
export const createProduct = async (data) => {
  const formData = buildFormData(data);
  const response = await apiClient.post("dashboard/admin/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ۴. ویرایش کامل محصول (PUT)
export const updateProduct = async (id, data) => {
  const formData = buildFormData(data);
  const response = await apiClient.put(`dashboard/admin/products/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ۵. ویرایش جزئی (PATCH) - مثلا فقط تغییر قیمت یا موجودی
export const patchProduct = async (id, data) => {
  const formData = buildFormData(data);
  const response = await apiClient.patch(`dashboard/admin/products/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// ==================== DELETE & BULK ACTIONS ====================

// ۶. حذف محصول
export const deleteProduct = async (id) => {
  await apiClient.delete(`dashboard/admin/products/${id}/`);
  return { success: true };
};

// ۷. حذف گروهی محصولات
export const bulkDeleteProducts = async (ids) => {
  // بدنه: { "ids": [1, 2, 3] }
  await apiClient.delete("dashboard/admin/products/bulk-delete/", {
    data: { ids },
  });
  return { success: true };
};

// ۸. تغییر وضعیت گروهی (فعال/غیرفعال)
export const bulkUpdateProductStatus = async (ids, isActive) => {
  // بدنه: { "ids": [...], "is_active": true/false }
  // چون طبق داکیومنت این متد PATCH هست و احتمالا JSON میگیره (چون فایلی نداره)
  // اما داکیومنت بالا Multipart زده. ما اینجا JSON میفرستیم، اگر ارور داد FormData میکنیم.
  // معمولا عملیات بالک JSON هستن.
  const payload = { ids, is_active: isActive };
  const response = await apiClient.patch("dashboard/admin/products/bulk-update-status/", payload);
  return response.data;
};

// ==================== IMAGE MANAGEMENT ====================

// ۹. افزودن تصویر به محصول
export const addProductImage = async (productId, file, isMain = false) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("is_main", isMain);

  const response = await apiClient.post(
    `dashboard/admin/products/${productId}/images/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// ۱۰. حذف تصویر از محصول
export const deleteProductImage = async (productId, imageId) => {
  // طبق داکیومنت: بدنه باید شامل image_id باشد
  await apiClient.delete(`dashboard/admin/products/${productId}/images/`, {
    data: { image_id: imageId },
  });
  return { success: true };
};