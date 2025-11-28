import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuthApi } from "../app/shop/api/UserAuthApi";
import { jwtDecode } from "jwt-decode";

const ShopAuthContext = createContext();

export const ShopAuthProvider = ({ children }) => {
  // ✅ اصلاح مهم: مقدار اولیه را مستقیماً از localStorage می‌خوانیم (Lazy Initialization)
  // این کار باعث می‌شود در اولین رندر، وضعیت لاگین درست باشد.
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) return jwtDecode(token);
    } catch (e) {
      console.error("Token decode error on init", e);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(false);

  // تابعی که فقط توکن را دیکود و استیت را آپدیت می‌کند
  const decodeUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (e) {
      logout();
    }
  };

  const login = async (username, password) => {
    try {
      const data = await UserAuthApi.login({ username, password });
      
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      decodeUser(data.access); // بلافاصله یوزر را آپدیت کن
      return { success: true };
    } catch (error) {
      let errorMsg = "نام کاربری یا رمز عبور اشتباه است.";
      if (error.response?.data?.detail) {
          errorMsg = error.response.data.detail;
      }
      return { success: false, message: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      await UserAuthApi.register(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: "خطا در ثبت نام" };
    }
  };

  const logout = () => {
    UserAuthApi.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <ShopAuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </ShopAuthContext.Provider>
  );
};

export const useShopAuth = () => useContext(ShopAuthContext);