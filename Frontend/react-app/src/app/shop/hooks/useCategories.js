import { useState, useCallback, useEffect } from "react";
import { CategoriesApi } from "../api/CategoriesApi";
import { handleApiError } from "@/utils/errorHandler";

export const useCategories = (autoFetch = false) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // دریافت خودکار (مناسب برای سایدبار یا مگامنو)
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return { categories, loading, error, fetchCategories };
};