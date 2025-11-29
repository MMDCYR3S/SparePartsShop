import { useState, useCallback, useEffect } from "react";
import { CarsApi } from "../api/CarsApi";

export const useCars = (autoFetch = false) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CarsApi.getCars();
      // هندل کردن هوشمند
      const list = Array.isArray(data) ? data : (data.results || []);
      setCars(list);
    } catch (err) {
      console.error("خطا در دریافت خودروها:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCars();
    }
  }, [autoFetch, fetchCars]);

  return { cars, loading, fetchCars };
};