import { useState, useEffect } from "react";
import { HomeApi } from "../api/HomeApi";
import { ProductsApi } from "../api/ProductsApi";

export const useHome = () => {
  const [banners, setBanners] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ banners: null, products: null });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // استفاده از allSettled برای اینکه اگر محصولات ۵۰۰ داد، بنرها نپرن
      const results = await Promise.allSettled([
        HomeApi.getBanners(),
        // 🛠️ اصلاح: حذف ordering=-created_at چون سرور ۵۰۰ میداد
        // فعلاً فقط ۱۰ تا محصول آخر رو بدون شرط سورت میگیریم
        ProductsApi.getProducts({ page_size: 10 }) 
      ]);

      const [bannersResult, productsResult] = results;

      // --- 1. پردازش بنرها ---
      if (bannersResult.status === "fulfilled") {
        const data = bannersResult.value;
        const list = Array.isArray(data) ? data : (data.results || []);
        // تلاش برای سورت بنرها، اگر اردر نداشتن مهم نیست
        setBanners(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        console.error("❌ Banners Failed:", bannersResult.reason);
        setErrors(prev => ({ ...prev, banners: "خطا در دریافت بنرها" }));
      }

      // --- 2. پردازش محصولات ---
      if (productsResult.status === "fulfilled") {
        const data = productsResult.value;
        const list = Array.isArray(data) ? data : (data.results || []);
        setNewestProducts(list);
      } else {
        // اگر باز هم ارور داد، لاگ دقیق میگیریم
        console.error("❌ Products Failed:", productsResult.reason);
        setErrors(prev => ({ ...prev, products: "خطا در دریافت محصولات" }));
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return { banners, newestProducts, loading, errors };
};