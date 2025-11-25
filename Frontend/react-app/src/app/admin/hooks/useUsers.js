// src/app/admin/hooks/useUsers.js
import { useState, useCallback, useEffect } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
} from "../api/UsersApi";

export const useUsers = () => {
  // ==================== States ====================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [filters, setFilters] = useState({
    search: "",
    ordering: "",
    page: 1,
  });
  
  // برای ذخیره اطلاعات صفحه‌بندی (تعداد کل و ...)
  const [paginationInfo, setPaginationInfo] = useState({
    count: 0,
    totalPages: 1,
  });

  // ==================== Actions (Logic) ====================

  // 1. دریافت لیست کاربران
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // پارامترها رو آماده می‌کنیم
      const params = {
        search: filters.search || undefined,
        ordering: filters.ordering || undefined,
        page: filters.page,
      };

      const data = await getUsers(params);
      
      // هندل کردن پاسخ (فرض بر اینکه پاسخ استاندارد DRF شامل results و count است)
      // اگر بکند صفحه‌بندی نداشته باشد، data خود آرایه است.
      if (Array.isArray(data)) {
        setUsers(data);
        setPaginationInfo({ count: data.length, totalPages: 1 });
      } else {
        setUsers(data.results || []);
        // محاسبه تعداد صفحات (فرض: 10 آیتم در هر صفحه)
        const total = data.count || 0;
        setPaginationInfo({
            count: total,
            totalPages: Math.ceil(total / 10) || 1
        });
      }
    } catch (err) {
      setError(err.message || "خطا در دریافت لیست کاربران");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // وقتی فیلترها عوض شد، دوباره فچ کن
  useEffect(() => {
    // دیبانس برای سرچ (اختیاری ولی حرفه‌ای)
    const timer = setTimeout(() => {
        fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);


  // 2. ساخت کاربر جدید
  const addUser = async (formData) => {
    setLoading(true);
    try {
      await createUser(formData);
      // بعد از موفقیت، لیست رو رفرش می‌کنیم
      await fetchUsers();
      return { success: true };
    } catch (err) {
      // ارور رو برمی‌گردونیم تا فرم بتونه نمایش بده
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. ویرایش کاربر
  const editUser = async (id, formData) => {
    setLoading(true);
    try {
      await updateUser(id, formData);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. حذف تکی
  const removeUser = async (id) => {
    if(!window.confirm("آیا از حذف این کاربر اطمینان دارید؟")) return;
    
    // آپتیمیستیک آپدیت (Optimistic Update): قبل از سرور از لیست حذف کن تا سریع به نظر بیاد
    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== id));

    try {
      await deleteUser(id);
    } catch (err) {
      // اگر خطا داد، لیست قبلی رو برگردون و ارور بده
      setUsers(previousUsers);
      alert("خطا در حذف کاربر");
    }
  };

  // 5. حذف گروهی
  const removeBulkUsers = async (ids) => {
    if(!window.confirm(`آیا از حذف ${ids.length} کاربر انتخاب شده اطمینان دارید؟`)) return;
    
    setLoading(true);
    try {
      await bulkDeleteUsers(ids);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      alert("خطا در حذف گروهی");
    } finally {
      setLoading(false);
    }
  };

  // ==================== Expose Hook ====================
  return {
    users,
    loading,
    error,
    filters,
    setFilters,
    paginationInfo,
    refresh: fetchUsers,
    actions: {
      addUser,
      editUser,
      removeUser,
      removeBulkUsers
    }
  };
};