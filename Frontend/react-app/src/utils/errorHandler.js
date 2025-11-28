export const handleApiError = (error) => {
  if (!error.response) {
    return "خطای شبکه! لطفاً اتصال اینترنت خود را بررسی کنید.";
  }

  const { data, status } = error.response;

  // خطاهای سرور (500)
  if (status >= 500) {
    return "مشکلی در سرور رخ داده است. لطفاً بعداً تلاش کنید.";
  }

  // خطاهای اعتبارسنجی (معمولا 400)
  if (status === 400 && data) {
    // اگر بک‌اند آرایه‌ای از خطاها فرستاد، اولین مورد را برگردان
    if (Array.isArray(data)) {
      return data[0];
    }
    
    // اگر آبجکت بود (مثل فرم‌های جنگو)
    if (typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      const firstError = data[firstKey];
      
      if (Array.isArray(firstError)) {
        return `${firstKey}: ${firstError[0]}`; // مثلا: password: رمز عبور ضعیف است
      }
      return JSON.stringify(firstError);
    }
  }

  // خطای عدم دسترسی (401/403)
  if (status === 401) {
    return "نشست شما منقضی شده است. لطفاً مجدد وارد شوید.";
  }

  return data?.detail || "خطای ناشناخته رخ داده است.";
};