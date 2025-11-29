import { useState, useCallback, useEffect } from "react";
import { CategoriesApi } from "../api/CategoriesApi";

export const useCategories = (autoFetch = false) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoriesApi.getCategories();
      // هندل کردن هوشمند: اگر آرایه بود خودش، اگر نه results
      const list = Array.isArray(data) ? data : (data.results || []);
      setCategories(list);
    } catch (err) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return { categories, loading, fetchCategories };
};