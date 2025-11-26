// src/app/admin/api/DashboardApi.jsx
import apiClient from "@/api/apiClient";

export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("dashboard/admin/index/");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};