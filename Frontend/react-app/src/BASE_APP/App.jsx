// src/BASE_APP/App.jsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute'; // ۲. ایمپورت دروازه‌بان

// صفحات
import AdminLoginPage from '../app/admin/pages/LoginPage';
import Dashboard from '../app/admin/pages/dashboard/Dashboard'; // صفحه داشبوردی که قبلا ساختیم

function App() {
  return (
    // ۳. کل اپلیکیشن رو داخل Provider بپیچون
    <div className="App">
      <Router>
        <AuthProvider>
        <Routes>
          {/* مسیر لاگین (عمومی) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* مسیرهای محافظت شده */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* مسیر پیش‌فرض: اگر کاربر وارد صفحه اصلی شد، ببرش به داشبورد */}
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
    </AuthProvider>
      </Router>
      </div>
  );
}

export default App;