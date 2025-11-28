import shopAxios from "../../../api/shopAxios";

export const ProductsApi = {
  // دریافت لیست محصولات با فیلترهای پیشرفته
  getProducts: async (params = {}) => {
    // params شامل: search, category, brand, min_price, max_price, ordering, page
    const response = await shopAxios.get("shop/products/", { params });
    return response.data;
  },

  // دریافت جزئیات تکی محصول
  getProductById: async (id) => {
    const response = await shopAxios.get(`shop/products/${id}/`);
    return response.data;
  }
};