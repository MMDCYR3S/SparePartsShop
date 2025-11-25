import apiClient from "@/api/apiClient";

// =================================================================
// 🛡️ Advanced Error Handler
// این تابع تمام ارورهای احتمالی سرور رو میگیره و به یک فرمت استاندارد
// برای نمایش در UI تبدیل میکنه.
// =================================================================
const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);

  if (error.response) {
    // خطاهای سمت سرور (4xx, 5xx)
    const { status, data } = error.response;
    
    // ارورهای اعتبارسنجی (مثلاً فرمت ایمیل غلطه یا کالا موجود نیست)
    if (status === 400) {
      // اگر دیتای ارور آرایه باشه یا آبجکت، استانداردش میکنیم
      const validationErrors = typeof data === 'object' ? data : { detail: data };
      throw {
        type: 'VALIDATION_ERROR',
        status: 400,
        message: 'اطلاعات وارد شده معتبر نیستند.',
        details: validationErrors // جزئیات فیلد به فیلد
      };
    }

    if (status === 403 || status === 401) {
      throw {
        type: 'AUTH_ERROR',
        status: status,
        message: 'شما دسترسی لازم برای انجام این عملیات را ندارید.'
      };
    }

    if (status === 404) {
      throw {
        type: 'NOT_FOUND',
        status: 404,
        message: 'سفارش یا آیتم مورد نظر یافت نشد.'
      };
    }

    // خطای داخلی سرور
    throw {
      type: 'SERVER_ERROR',
      status: status,
      message: 'خطای سرور. لطفاً دقایقی دیگر تلاش کنید.'
    };
  } else if (error.request) {
    // خطای شبکه (اینترنت قطع است)
    throw {
      type: 'NETWORK_ERROR',
      status: 0,
      message: 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید.'
    };
  } else {
    // خطای ناشناخته در کد فرانت
    throw {
      type: 'UNKNOWN_ERROR',
      status: -1,
      message: error.message
    };
  }
};

// ==================== READ (لیست و جزئیات) ====================

// ۱. دریافت لیست سفارشات (با جستجو، مرتب‌سازی و صفحه‌بندی)
export const getOrders = async (params = {}) => {
  // params: { search, ordering, page, page_size }
  try {
    const response = await apiClient.get("dashboard/admin/orders/", { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, "getOrders");
  }
};

// ۲. دریافت جزئیات یک سفارش خاص
export const getOrderById = async (id) => {
  try {
    const response = await apiClient.get(`dashboard/admin/orders/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// ==================== CREATE / UPDATE (مدیریت سفارش) ====================

// ۳. ایجاد سفارش دستی (توسط ادمین)
// Body Example: { user: 1, status: "pending", items_data: [{product_id: 10, quantity: 2}] }
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post("dashboard/admin/orders/", orderData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "createOrder");
  }
};

// ۴. ویرایش کامل سفارش (PUT)
export const updateOrder = async (id, data) => {
  try {
    const response = await apiClient.patch(`dashboard/admin/orders/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

// ۵. ویرایش جزئی سفارش (PATCH) - مثلاً فقط تغییر وضعیت یا آدرس
export const patchOrder = async (id, orderData) => {
  try {
    const response = await apiClient.patch(`dashboard/admin/orders/${id}/`, orderData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `patchOrder(${id})`);
  }
};

// ==================== DELETE (حذف) ====================

// ۶. حذف یک سفارش
export const deleteOrder = async (id) => {
  try {
    await apiClient.delete(`dashboard/admin/orders/${id}/`);
    return { success: true };
  } catch (error) {
    throw handleApiError(error, `deleteOrder(${id})`);
  }
};

// ==================== BULK ACTIONS (عملیات گروهی) ====================

// ۷. حذف گروهی سفارشات
// Input: [1, 5, 8]
export const bulkDeleteOrders = async (ids) => {
  try {
    // نکته مهم: در Axios متد delete برای ارسال body نیاز به کلید `data` دارد
    await apiClient.delete("dashboard/admin/orders/bulk-delete/", {
      data: { ids }
    });
    return { success: true };
  } catch (error) {
    throw handleApiError(error, "bulkDeleteOrders");
  }
};

// ۸. تغییر وضعیت گروهی سفارشات
// Input: ids=[1,2], status="confirmed"
export const bulkUpdateOrderStatus = async (ids, status) => {
  try {
    const payload = { ids, status };
    const response = await apiClient.patch("dashboard/admin/orders/bulk-update-status/", payload);
    return response.data;
  } catch (error) {
    throw handleApiError(error, "bulkUpdateOrderStatus");
  }
};

// ۹. حذف گروهی آیتم‌های داخل یک سفارش (خیلی خاص و کاربردی)
// Input: orderId=10, itemIds=[101, 102]
export const bulkDeleteOrderItems = async (orderId, itemIds) => {
  try {
    await apiClient.delete("dashboard/admin/orders/bulk-delete-items/", {
      data: {
        order_id: orderId,
        item_ids: itemIds
      }
    });
    return { success: true };
  } catch (error) {
    throw handleApiError(error, "bulkDeleteOrderItems");
  }
};