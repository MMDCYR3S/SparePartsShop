import { useState, useCallback } from "react";
import { ProductsApi } from "../api/ProductsApi";
import { handleApiError } from "@/utils/errorHandler";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null); // برای صفحه جزئیات
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // دریافت لیست (با قابلیت صفحه‌بندی و فیلتر)
  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductsApi.getProducts(filters);
      setProducts(data); // اگر بکند pagination داره، شاید data.results باشه
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // دریافت تکی
  const fetchProductDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductsApi.getProductById(id);
      setProduct(data);
      return data;
    } catch (err) {
      const msg = handleApiError(err);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    product,
    loading,
    error,
    fetchProducts,
    fetchProductDetail
  };
};