// src/app/admin/pages/users/UserManagement.jsx
import React, { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import UserFormModal from "./components/UserFormModal";
import { 
  UserPlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, 
  ShieldCheckIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, 
  ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

const UserManagement = () => {
  const { 
    users, loading, error, filters, setFilters, paginationInfo, actions, refresh 
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // برای بالک اکشن
  const [selectedIds, setSelectedIds] = useState(new Set());

  // مودال
  const openModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    // ترای-کچ رو بردیم تو خود کامپوننت مودال تا ارور رو نشون بده
    // اینجا فقط منتظر میمونیم تموم شه تا رفرش کنیم (که هوک انجام میده)
    if (editingUser) {
      await actions.editUser(editingUser.id, formData);
    } else {
      await actions.addUser(formData);
    }
  };

  // --- هندلرهای انتخاب گروهی ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
     const ids = Array.from(selectedIds);
     const res = await actions.removeBulkUsers(ids);
     if (res && res.success) {
        setSelectedIds(new Set());
     }
  };

  // --- هندلرهای سورت و فیلتر ---
  const handleSort = (field) => {
    // اگر همین الان داریم روی همین فیلد سورت میکنیم، برعکسش کن
    // اگر ordering='username' باشه، کلیک بعدی میشه '-username'
    const currentOrder = filters.ordering || "";
    let newOrder = field;
    if (currentOrder === field) {
        newOrder = `-${field}`;
    } else if (currentOrder === `-${field}`) {
        newOrder = ""; // سورت رو حذف کن
    }
    setFilters(prev => ({ ...prev, ordering: newOrder, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
        setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // کامپوننت هدر جدول برای سورت تمیز
  const SortableTh = ({ label, field }) => {
     const isActive = filters.ordering?.includes(field);
     return (
        <th 
            className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none group"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                <ArrowsUpDownIcon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-gray-300 group-hover:text-gray-400'}`} />
            </div>
        </th>
     );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary">مدیریت کاربران</h1>
          <p className="text-sm text-gray-500 mt-1">لیست تمام کاربران و ادمین‌های سیستم</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
        >
          <UserPlusIcon className="w-5 h-5" />
          افزودن کاربر
        </button>
      </div>

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="جستجو در نام کاربری، ایمیل..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 focus:ring-2 focus:ring-accent outline-none transition-all"
          />
        </div>

        {/* Bulk Actions Display */}
        {selectedIds.size > 0 && (
           <div className="flex items-center gap-3 w-full md:w-auto animate-fadeInUp">
              <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                 {selectedIds.size} انتخاب شده
              </span>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-bold transition-colors"
              >
                 <TrashIcon className="w-5 h-5" /> حذف گروهی
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
              </button>
           </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>
        ) : error ? (
           <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
               <p>{error}</p>
               <button onClick={refresh} className="text-blue-500 underline">تلاش مجدد</button>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                    <th className="px-6 py-4 w-10">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                            checked={users.length > 0 && selectedIds.size === users.length}
                            onChange={handleSelectAll}
                        />
                    </th>
                    <SortableTh label="کاربر" field="username" />
                    <SortableTh label="ایمیل / موبایل" field="email" />
                    <th className="px-6 py-4 text-center">دسترسی‌ها</th>
                    <SortableTh label="وضعیت" field="is_active" />
                    <th className="px-6 py-4 text-center">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {users.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">کاربری یافت نشد.</td></tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id} className={`hover:bg-blue-50/40 transition-colors group ${selectedIds.has(user.id) ? 'bg-blue-50/60' : ''}`}>
                            
                            {/* Checkbox */}
                            <td className="px-6 py-4">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                                    checked={selectedIds.has(user.id)}
                                    onChange={() => handleSelectRow(user.id)}
                                />
                            </td>

                            {/* User Info */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-300">
                                        {user.photo ? (
                                            <img src={user.photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100 text-lg">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">@{user.username}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Contact */}
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-600 font-mono">{user.email}</span>
                                    {user.phone && <span className="text-xs text-gray-400 font-mono">{user.phone}</span>}
                                </div>
                            </td>

                            {/* Roles */}
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-1">
                                    {user.is_superuser && (
                                        <span className="bg-purple-100 text-purple-700 p-1.5 rounded-md" title="Super Admin">
                                            <ShieldCheckIcon className="w-4 h-4" />
                                        </span>
                                    )}
                                    {user.is_staff && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex items-center h-fit self-center">
                                            Admin
                                        </span>
                                    )}
                                    {!user.is_staff && !user.is_superuser && (
                                        <span className="text-gray-400 text-xs">کاربر عادی</span>
                                    )}
                                </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                                {user.is_active ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> فعال
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
                                        <XCircleIcon className="w-3.5 h-3.5" /> غیرفعال
                                    </span>
                                )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => actions.removeUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {paginationInfo.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        نمایش صفحه {filters.page} از {paginationInfo.totalPages} (کل رکوردها: {paginationInfo.count})
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={filters.page === 1}
                            onClick={() => handlePageChange(filters.page - 1)}
                            className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-100"
                        >
                            <ChevronRightIcon className="w-4 h-4" /> {/* چون راست‌چین هستیم آیکون برعکس میشه */}
                        </button>
                        
                        {/* شماره صفحات ساده */}
                        {[...Array(paginationInfo.totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-8 h-8 rounded-lg text-sm font-bold ${
                                    filters.page === i + 1 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white border text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            disabled={filters.page === paginationInfo.totalPages}
                            onClick={() => handlePageChange(filters.page + 1)}
                            className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-gray-100"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
          </>
        )}
      </div>

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={editingUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default UserManagement;