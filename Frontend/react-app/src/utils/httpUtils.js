// src/utils/httpUtils.js

/**
 * تبدیل آبجکت جاوااسکریپت به FormData برای ارسال فایل
 * @param {Object} data - آبجکت داده‌ها
 * @returns {FormData}
 */
export const objectToFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    // مقادیر null یا undefined را نادیده می‌گیریم (اختیاری)
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // برای آرایه‌ها (مثلاً لیست آدرس‌ها یا تگ‌ها)
      // بسته به بکند، ممکن است نیاز باشد key[] فرستاده شود یا key تکرار شود.
      // در جنگو معمولاً تکرار کلید کافیست: key=val1&key=val2
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (value instanceof File || value instanceof Blob) {
      // فایل‌ها
      formData.append(key, value);
    } else if (typeof value === 'object') {
       // اگر آبجکت تو در تو باشد (مثل آدرس)، معمولا باید استرینگ شود یا فلت شود.
       // فعلاً فرض می‌کنیم JSON استرینگ می‌شود مگر اینکه فایل باشد.
       formData.append(key, JSON.stringify(value));
    } else {
      // رشته‌ها، اعداد و بولین‌ها
      formData.append(key, value);
    }
  });

  return formData;
};