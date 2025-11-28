import shopAxios from "../../../api/shopAxios";

export const CheckoutApi = {
  // دریافت اطلاعات قبل از فاکتور (آدرس‌ها و سامری)
  getCheckoutInfo: async () => {
    const response = await shopAxios.get("orders/checkout/");
    return response.data;
  },

  // ثبت نهایی سفارش
  submitOrder: async (data) => {
    // data: { address_id, payment_type }
    const response = await shopAxios.post("orders/checkout/", data);
    return response.data;
  }
};