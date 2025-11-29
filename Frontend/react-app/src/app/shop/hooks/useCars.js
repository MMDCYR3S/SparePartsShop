import { useState, useCallback, useEffect } from "react";
import { CarsApi } from "../api/CarsApi";
import { handleApiError } from "@/utils/errorHandler";

export const useCars = (autoFetch = false) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CarsApi.getCars();
      setCars(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // اگر autoFetch ترو باشد، همان اول دریافت می‌کند (مناسب برای دراپ‌داون فیلترها)
  useEffect(() => {
    if (autoFetch) {
      fetchCars();
    }
  }, [autoFetch, fetchCars]);

  return { cars, loading, error, fetchCars };
};