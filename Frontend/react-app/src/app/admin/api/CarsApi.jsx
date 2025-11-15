// src/app/admin/api/CarsApi.jsx
// به جای axios، از apiClient هوشمندمون import می‌کنیم
import apiClient from "../../../api/apiClient"; 

const getCars = async () => {
  try {
    // دیگه نیازی به چسبوندن BASE_API نیست! apiClient خودشش رو داره
    const response = await apiClient.get("dashboard/admin/cars/");
    return response.data;
  } catch (error) {
    console.error("Error fetching cars data:", error);
    // اگه خطای 401 (عدم دسترسی) داد، اینجا می‌تونی مدیریتش کنی
    if (error.response && error.response.status === 401) {
        console.error("دسترسی غیرمجاز! شاید توکن منقضی شده.");
        // اینجا می‌تونی تابع logout از AuthContext رو صدا بزنی
    }
    return [];
  }
};

export default getCars;