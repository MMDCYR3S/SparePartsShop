// src/app/shop/hooks/useProducts.js
import { useState, useCallback, useEffect } from "react";
import { ProductsApi } from "../api/ProductsApi";
import { handleApiError } from "@/utils/errorHandler";

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState([]); // دیتای خام کل محصولات
  const [products, setProducts] = useState([]); // دیتای فیلتر و صفحه بندی شده برای نمایش
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تنظیمات پیجینیشن
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12, // تعداد آیتم در هر صفحه
    totalPages: 1,
    totalItems: 0
  });

  // 1. دریافت کل دیتا از سرور (فقط یکبار اجرا شود)
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductsApi.getProducts(); // دریافت همه محصولات
      
      // طبق جیسون شما، خروجی مستقیماً آرایه است
      const results = Array.isArray(data) ? data : (data.results || []);
      
      setAllProducts(results);
      return results;
    } catch (err) {
      setError(handleApiError(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. انجین پردازش (سرچ، فیلتر، سورت و پیجینیشن) - تماماً فرانتی
  const processProducts = useCallback((filters = {}, page = 1) => {
    // اگر دیتایی نداریم، پردازش نکن
    if (allProducts.length === 0) {
        setProducts([]);
        return;
    }

    let result = [...allProducts];

    // --- الف: جستجو ---
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.part_code && p.part_code.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // --- ب: فیلتر دسته‌بندی ---
    if (filters.category) {
      // بررسی هم بر اساس نام و هم آیدی (چون در جیسون category_name دارید)
      result = result.filter(p => 
          p.category === filters.category || 
          p.category_name === filters.category
      );
    }
    
    // --- ج: فیلتر خودرو ---
    if (filters.car_model) {
      // اگر compatible_cars دارید
      result = result.filter(p => p.compatible_cars?.some(c => c.model === filters.car_model));
    }

    // --- د: مرتب‌سازی ---
    if (filters.ordering) {
      const isDesc = filters.ordering.startsWith('-');
      const field = filters.ordering.replace('-', '');
      
      result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        // تبدیل قیمت به عدد برای مقایسه درست
        if (field === 'price') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // --- هـ: پیجینیشن ---
    const itemsPerPage = 12;
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    // جلوگیری از رفتن به صفحه نامعتبر
    const safePage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (safePage - 1) * itemsPerPage;
    const paginatedData = result.slice(startIndex, startIndex + itemsPerPage);

    setProducts(paginatedData);
    setPagination({
      currentPage: safePage,
      itemsPerPage,
      totalPages,
      totalItems
    });

  }, [allProducts]);

  // متد کمکی برای دریافت جزئیات تکی (هنوز سروری است)
  const fetchProductDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await ProductsApi.getProductById(id);
      return data;
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,        // خروجی نهایی برای نمایش
    allProducts,     // دیتای خام (جهت اطمینان)
    pagination,
    loading,
    error,
    fetchAllProducts,
    processProducts,
    fetchProductDetail
  };
};