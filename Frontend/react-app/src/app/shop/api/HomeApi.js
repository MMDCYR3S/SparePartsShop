import shopAxios from "@/api/shopAxios";

export const HomeApi = {
  getBanners: async () => {
    const response = await shopAxios.get("home/banners/");
    return response.data;
  }
};