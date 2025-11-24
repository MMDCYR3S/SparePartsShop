// src/BASE_APP/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Layouts
import AdminLayout from '../app/admin/layout/AdminLayout';

// Pages
import AdminLoginPage from '../app/admin/pages/LoginPage';
import Dashboard from '../app/admin/pages/dashboard/Dashboard';
import TestPage from '../app/admin/pages/test/TestPage';
import CategoryManagement from '../app/admin/pages/Categories/CategoryManagement';

import ProductList from '../app/admin/pages/products/home/products_list/ProductList';
import ProductDetail from '../app/admin/pages/products/product_view/ProductDetail';
import ProductForm from '../app/admin/pages/products/new_product/ProductForm';



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* مسیر لاگین (عمومی) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* مسیرهای محافظت شده با لایوت ادمین */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>

            {/* مسیر های داخلی ادمین پنل */}
            {/* مسیرهای داخلی relative به /admin هستن */}
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products/view/:id" element={<ProductDetail />} />
            <Route path="products/new" element={<ProductForm />} />
<Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="test" element={<TestPage />} />

            {/* مسیر پیش‌فرض برای داشبورد */}
            <Route path="" element={<Navigate to="dashboard" />} />
          </Route>
          
          {/* مسیر اصلی سایت رو به پنل ادمین هدایت کن */}
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;