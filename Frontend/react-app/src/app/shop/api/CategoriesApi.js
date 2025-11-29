import shopAxios from "../../../api/shopAxios";

export const CategoriesApi = {
  // دریافت لیست دسته‌بندی‌ها
  getCategories: async () => {
    const response = await shopAxios.get("shop/categories/");
    return response.data;
  },

  // دریافت اطلاعات یک دسته‌بندی خاص
  getCategoryById: async (id) => {
    const response = await shopAxios.get(`shop/categories/${id}/`);
    return response.data;
  }
};