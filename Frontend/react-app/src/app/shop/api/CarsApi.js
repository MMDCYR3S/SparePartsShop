import shopAxios from "../../../api/shopAxios";

export const CarsApi = {
  // دریافت لیست تمام خودروها
  getCars: async () => {
    const response = await shopAxios.get("shop/cars/");
    return response.data;
  },

  // دریافت اطلاعات یک خودرو خاص
  getCarById: async (id) => {
    const response = await shopAxios.get(`shop/cars/${id}/`);
    return response.data;
  }
};