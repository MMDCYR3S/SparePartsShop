// src/BASE_APP/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- Contexts ---
import { AuthProvider } from "../context/AuthContext"; // کانتکست ادمین
import { ShopAuthProvider } from "../context/ShopAuthContext"; // کانتکست جدید فروشگاه (حتما ایمپورت شود)

import ProtectedRoute from "../components/ProtectedRoute";

// --- Admin Imports ---
import AdminLayout from "../app/admin/layout/AdminLayout";
import AdminLoginPage from "../app/admin/pages/LoginPage";
import Dashboard from "../app/admin/pages/dashboard/Dashboard";
import TestPage from "../app/admin/pages/test/TestPage";
import CategoryManagement from "../app/admin/pages/Categories/CategoryManagement";
import ProductList from "../app/admin/pages/products/home/products_list/ProductList";
import ProductDetail from "../app/admin/pages/products/product_view/ProductDetail";
import ProductFormAdmin from "../app/admin/pages/products/new_product/ProductForm";
import OrdersDashboard from "../app/admin/pages/orders/OrdersDashboard";
import OrderDetail from "../app/admin/pages/orders/order/OrderDetail";
import OrderForm from "../app/admin/pages/orders/new/OrderForm";
import UserManagement from "../app/admin/pages/users/UserManagement";
import UserDetail from "../app/admin/pages/users/userDetail";
import BannerManagement from "../app/admin/pages/settings/banner/BannerManagement";
import PaymentManagement from "../app/admin/pages/payments/PaymentManagement";

// --- Shop Imports ---
import ShopLayout from "../app/shop/layout/ShopLayout";
import HomePage from "../app/shop/pages/Home";
import UserLoginPage from "../app/shop/pages/auth/UserLoginPage";
import UserRegisterPage from "../app/shop/pages/auth/UserRegisterPage"; // صفحه جدید

function App() {
  return (
    <Router>
      {/* نکته مهم معماری:
          ما دو تا کانتکست جدا داریم. 
          1. AuthProvider -> برای ادمین
          2. ShopAuthProvider -> برای مشتری
          
          میتونیم اینها رو تو در تو بذاریم یا جدا کنیم. 
          برای راحتی کار فعلا ShopAuthProvider رو دور کل روت های شاپ میذاریم.
      */}
      
      <AuthProvider> {/* کانتکست ادمین (اگر سراسریه) */}
        <ShopAuthProvider> {/* <--- این خط حیاتیه! کانتکست مشتری */}
          
          <Routes>
            {/* =========================================
                بخش مشتری (Storefront)
               ========================================= */}
            <Route path="/" element={<ShopLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<UserLoginPage />} />
              <Route path="register" element={<UserRegisterPage />} />
              {/* سایر صفحات مشتری */}
            </Route>

            {/* =========================================
                بخش ادمین پنل (Admin Panel)
               ========================================= */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/view/:id" element={<ProductDetail />} />
              <Route path="products/new" element={<ProductFormAdmin />} />
              <Route path="products/edit/:id" element={<ProductFormAdmin />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrdersDashboard />} />
              <Route path="orders/view/:id" element={<OrderDetail />} />
              <Route path="orders/new" element={<OrderForm />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/view/:id" element={<UserDetail />} />
              <Route path="banners" element={<BannerManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="test" element={<TestPage />} />
            </Route>

            {/* صفحه 404 */}
            <Route path="*" element={<div className="p-10 text-center">404 - صفحه پیدا نشد</div>} />
          </Routes>
          
        </ShopAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;