// src/app/admin/pages/payments/PaymentManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  getPayments, 
  deletePayment, 
  bulkDeletePayments, 
  bulkUpdatePaymentStatus 
} from "@/app/admin/api/PaymentsApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  MagnifyingGlassIcon, TrashIcon, CheckBadgeIcon, 
  BanknotesIcon, CreditCardIcon, FunnelIcon, XMarkIcon 
} from "@heroicons/react/24/outline";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // فیلتر و جستجو
  const [search, setSearch] = useState("");
  
  // انتخاب گروهی
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // 1. دریافت اطلاعات
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPayments({ search });
      setPayments(data); // فرض بر این است که دیتا آرایه مستقیم است (طبق curl)
    } catch (err) {
      alert("خطا در دریافت لیست پرداخت‌ها");
    } finally {
      setLoading(false);
    }
  };

  // دیبانس برای سرچ
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. هندلرهای انتخاب
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(payments.map(p => p.id)));
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

  // 3. عملیات گروهی (حذف)
  const handleBulkDelete = async () => {
    if (!window.confirm(`آیا از حذف ${selectedIds.size} پرداخت انتخاب شده مطمئن هستید؟`)) return;
    
    setActionLoading(true);
    try {
      await bulkDeletePayments(Array.from(selectedIds));
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      alert("خطا در حذف گروهی");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. عملیات گروهی (تغییر وضعیت)
  const handleBulkStatus = async (newStatus) => {
    if (!window.confirm(`وضعیت ${selectedIds.size} آیتم به "${newStatus}" تغییر کند؟`)) return;

    setActionLoading(true);
    try {
      await bulkUpdatePaymentStatus(Array.from(selectedIds), newStatus);
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      alert("خطا در تغییر وضعیت گروهی");
    } finally {
      setActionLoading(false);
    }
  };

  // فرمت قیمت
  const formatPrice = (p) => Number(p).toLocaleString('fa-IR');

  // هلپر استاتوس
  const getStatusBadge = (status, display) => {
      const styles = {
          pending: 'bg-amber-100 text-amber-700 border-amber-200',
          completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          failed: 'bg-red-100 text-red-700 border-red-200',
          refunded: 'bg-gray-100 text-gray-700 border-gray-200',
      };
      return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[status] || styles.pending}`}>
              {display || status}
          </span>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <BanknotesIcon className="w-8 h-8 text-primary" />
            مدیریت تراکنش‌ها
        </h1>
        <p className="text-sm text-gray-500 mt-1">لیست تمامی پرداخت‌های موفق، ناموفق و در انتظار تایید</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 h-auto min-h-[72px]">
        
        {/* Search */}
        <div className={`relative w-full md:w-96 transition-all duration-300 ${selectedIds.size > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="جستجو در نام کاربر، شناسه سفارش..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 focus:ring-2 focus:ring-accent outline-none"
          />
        </div>

        {/* Bulk Actions (Conditional) */}
        {selectedIds.size > 0 && (
           <div className="flex items-center gap-2 w-full md:w-auto animate-fadeInUp bg-blue-50/50 p-1.5 rounded-xl border border-blue-100">
              <span className="text-sm font-bold text-blue-800 px-3">
                 {selectedIds.size} مورد
              </span>
              
              <div className="h-6 w-px bg-blue-200 mx-1"></div>

              {/* Approve Button */}
              <button 
                onClick={() => handleBulkStatus('completed')}
                disabled={actionLoading}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-md shadow-emerald-200"
              >
                 <CheckBadgeIcon className="w-4 h-4" /> تایید (Completed)
              </button>

              {/* Delete Button */}
              <button 
                onClick={handleBulkDelete}
                disabled={actionLoading}
                className="flex items-center gap-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
              >
                 <TrashIcon className="w-4 h-4" /> حذف
              </button>
              
              <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                  <XMarkIcon className="w-5 h-5" />
              </button>
           </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>
        ) : payments.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <BanknotesIcon className="w-16 h-16 mb-2 opacity-20" />
               <p>هیچ تراکنشی یافت نشد.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4 w-10">
                      <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                          checked={payments.length > 0 && selectedIds.size === payments.length}
                          onChange={handleSelectAll}
                      />
                  </th>
                  <th className="px-6 py-4">شناسه / تاریخ</th>
                  <th className="px-6 py-4">کاربر</th>
                  <th className="px-6 py-4">اطلاعات سفارش</th>
                  <th className="px-6 py-4">نوع پرداخت</th>
                  <th className="px-6 py-4 text-center">وضعیت</th>
                  <th className="px-6 py-4">مبلغ (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(pay => (
                    <tr 
                        key={pay.id} 
                        className={`hover:bg-blue-50/40 transition-colors group ${selectedIds.has(pay.id) ? 'bg-blue-50/60' : ''}`}
                    >
                        {/* Checkbox */}
                        <td className="px-6 py-4">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                                checked={selectedIds.has(pay.id)}
                                onChange={() => handleSelectRow(pay.id)}
                            />
                        </td>

                        {/* ID & Transaction Code */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 text-sm">#{pay.id}</span>
                                <span className="text-xs text-gray-400 font-mono mt-1" title="کد پیگیری">
                                    {pay.transaction_id || '---'}
                                </span>
                            </div>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {pay.order_summary?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm text-gray-700 font-medium">
                                    {pay.order_summary?.username || 'کاربر حذف شده'}
                                </span>
                            </div>
                        </td>

                        {/* Order Info */}
                        <td className="px-6 py-4">
                            <div className="text-sm">
                                <span className="text-gray-500">سفارش: </span>
                                <span className="font-mono font-bold text-primary hover:underline cursor-pointer">
                                    #{pay.order}
                                </span>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {pay.order_summary?.status ? (
                                        <span>وضعیت سفارش: {pay.order_summary.status}</span>
                                    ) : ''}
                                </div>
                            </div>
                        </td>

                        {/* Payment Type */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <CreditCardIcon className="w-4 h-4" />
                                {pay.payment_type_display}
                            </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                            {getStatusBadge(pay.status, pay.status_display)}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                            {/* اگر مبلغ پرداخت 0 بود (مثل مثال اول داکیومنت)، مبلغ کل سفارش رو نشون بده */}
                            <div className="font-bold text-gray-800 text-sm">
                                {Number(pay.amount) > 0 
                                    ? formatPrice(pay.amount) 
                                    : <span className="text-gray-400" title="مبلغ ثبت شده در تراکنش 0 است">{formatPrice(pay.order_summary?.total_amount || 0)}*</span>
                                }
                            </div>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;