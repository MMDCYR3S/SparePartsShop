import shopAxios from "../../../api/shopAxios";

export const CategoriesApi = {
  // دریافت لیست دسته‌بندی‌ها (بدون پیجینیشن یا با پیجینیشن بزرگ)
  getCategories: async () => {
    // پارامتر page_size بزرگ می‌فرستیم که همه رو بگیریم
    const response = await shopAxios.get("shop/categories/", { params: { page_size: 1000 } });
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await shopAxios.get(`shop/categories/${id}/`);
    return response.data;
  }
};