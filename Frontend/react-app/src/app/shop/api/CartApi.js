import shopAxios from "../../../api/shopAxios";

export const CartApi = {
  // دریافت سبد خرید فعلی
  getCart: async () => {
    const response = await shopAxios.get("carts/");
    return response.data;
  },

  // افزودن به سبد خرید
  addToCart: async (productId) => {
    const response = await shopAxios.post("carts/add/", { product_id: productId });
    return response.data;
  },

  // حذف یک آیتم خاص
  removeItem: async (itemId) => {
    const response = await shopAxios.delete(`carts/remove/${itemId}/`);
    return response.data;
  },

  // خالی کردن کل سبد
  clearCart: async () => {
    const response = await shopAxios.delete("carts/");
    return response.data;
  }
};