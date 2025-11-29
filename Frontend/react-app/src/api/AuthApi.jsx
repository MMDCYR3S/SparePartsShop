// src/app/user/api/authApi.js
import axios from "axios";
import BASE_API from "../../BASE_API";

// ثبت‌نام کاربر
export const userRegister = async (userData) => {
  try {
    const response = await axios.post(BASE_API + "/accounts/register/", userData);
    return response.data;
  } catch (error) {
    console.error("User registration failed:", error);
    throw error;
  }
};

// ورود کاربر (مشابه ادمین)
export const userLogin = async (username, password) => {
  try {
    const response = await axios.post(BASE_API + "/accounts/login/", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("User login failed:", error);
    throw error;
  }
};

// خروج کاربر (مشابه ادمین)
export const userLogout = async (refreshToken) => {
    // ... کد مشابه adminLogout
};