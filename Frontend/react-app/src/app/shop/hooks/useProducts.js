// src/app/shop/hooks/useProducts.js
import { useState, useCallback, useMemo } from "react";
import { ProductsApi } from "../api/ProductsApi";
import { handleApiError } from "@/utils/errorHandler";

export const useProducts = () => {
  const [allProducts, setAllProducts] = useState([]); // دیتای خام کامل
  const [processedProducts, setProcessedProducts] = useState([]); // دیتای فیلتر شده برای نمایش
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تنظیمات پیجینیشن لوکال
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
    totalItems: 0
  });

  // 1. دریافت اولیه کل دیتا (یکبار اجرا شود)
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      // درخواست بدون فیلتر برای گرفتن همه (یا با page_size بزرگ)
      const data = await ProductsApi.getProducts({ page_size: 1000 }); 
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

  // 2. انجین پردازش دیتا (سرچ، فیلتر، سورت و پیجینیشن فرانتی)
  const processProducts = useCallback((filters = {}, page = 1) => {
    let result = [...allProducts];

    // --- الف: فیلترینگ و جستجو ---
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.part_code?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      result = result.filter(p => p.category?.id == filters.category || p.category == filters.category);
    }
    
    if (filters.car_model) {
      // فرض بر اینکه compatible_cars آرایه است
      result = result.filter(p => p.compatible_cars?.some(c => c.model === filters.car_model));
    }

    // --- ب: سورتینگ ---
    if (filters.ordering) {
      const isDesc = filters.ordering.startsWith('-');
      const field = filters.ordering.replace('-', '');
      
      result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        // هندل کردن قیمت که رشته است
        if (field === 'price') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // --- ج: پیجینیشن ---
    const itemsPerPage = 10;
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = result.slice(startIndex, startIndex + itemsPerPage);

    setProcessedProducts(paginatedData);
    setPagination({
      currentPage: page,
      itemsPerPage,
      totalPages,
      totalItems
    });

  }, [allProducts]);

  const fetchProductDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await ProductsApi.getProductById(id);
      setProduct(data);
      return data;
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products: processedProducts, // خروجی نهایی برای نمایش
    allCount: allProducts.length,
    pagination,
    loading,
    error,
    fetchAllProducts, // متد گرفتن دیتا
    processProducts, // متد فیلتر کردن لوکال
    fetchProductDetail,
    product
  };
};