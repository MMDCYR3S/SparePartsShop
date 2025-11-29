import shopAxios from "../../../api/shopAxios";

export const CarsApi = {
  // دریافت لیست خودروها
  getCars: async () => {
    const response = await shopAxios.get("shop/cars/", { params: { page_size: 1000 } });
    return response.data;
  },

  getCarById: async (id) => {
    const response = await shopAxios.get(`shop/cars/${id}/`);
    return response.data;
  }
};