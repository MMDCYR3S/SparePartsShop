import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getOrders, 
  bulkDeleteOrders, 
  bulkUpdateOrderStatus 
} from '@/app/admin/api/OrdersApi';

// Icons
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon,
  EyeIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '@/components/LoadingSpinner';

// ==================== Components ====================

const StatCard = ({ title, value, icon: Icon, colorClass, subText }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-800 group-hover:scale-105 transition-transform origin-right">
        {value}
      </h3>
      {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const StatusBadge = ({ status, display }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  const defaultStyle = 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[status] || defaultStyle} flex items-center gap-1 w-fit`}>
      {status === 'delivered' && <CheckBadgeIcon className="w-3 h-3" />}
      {display || status}
    </span>
  );
};

const OrdersDashboard = () => {
  const navigate = useNavigate();

  // ==================== States ====================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-order_date');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState('confirmed');

  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, totalAmount: 0, cancelled: 0 });

  // ==================== Data Fetching ====================
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: search || undefined,
        ordering: ordering,
      };
      
      const data = await getOrders(params);
      const list = Array.isArray(data) ? data : (data.results || []);
      setOrders(list);
      
      // Calculate Stats
      const calculatedStats = {
        total: list.length,
        pending: list.filter(o => o.status === 'pending').length,
        cancelled: list.filter(o => o.status === 'cancelled').length,
        totalAmount: list.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
      };
      setStats(calculatedStats);

    } catch (err) {
      setError(err.message || 'خطای سرور');
    } finally {
      setLoading(false);
    }
  }, [search, ordering]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 500);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // ==================== Client Logic ====================
  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false;
    return true;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // ==================== Bulk Handlers ====================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select only visible orders (or all, depending on UX preference)
      // Here selecting ALL filtered orders
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
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
    if (!window.confirm(`آیا از حذف ${selectedIds.size} سفارش انتخاب شده اطمینان دارید؟`)) return;
    try {
      await bulkDeleteOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchOrders();
    } catch (err) {
      alert('خطا در حذف گروهی: ' + err.message);
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      await bulkUpdateOrderStatus(Array.from(selectedIds), bulkStatusTarget);
      setIsBulkStatusModalOpen(false);
      setSelectedIds(new Set());
      fetchOrders();
      alert('وضعیت سفارشات با موفقیت تغییر کرد.');
    } catch (err) {
      alert('خطا در بروزرسانی وضعیت: ' + err.message);
    }
  };

  // ==================== Render ====================
  const formatPrice = (p) => Number(p).toLocaleString('fa-IR');
  const formatDate = (d) => new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2">
            <ShoppingBagIcon className="w-7 h-7 text-accent" />
            مدیریت سفارشات
          </h1>
          <p className="text-sm text-gray-500 mt-1">بررسی وضعیت فروش و پیگیری سفارش‌های مشتریان</p>
        </div>
        <button 
          onClick={() => navigate('/admin/orders/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          ثبت سفارش دستی
        </button>
      </div>

      {/* 2. Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="کل سفارشات" value={stats.total.toLocaleString('fa-IR')} icon={ShoppingBagIcon} colorClass="bg-blue-500" />
        <StatCard title="در انتظار بررسی" value={stats.pending.toLocaleString('fa-IR')} icon={ClockIcon} colorClass="bg-amber-500" />
        <StatCard title="فروش کل (تومان)" value={formatPrice(stats.totalAmount)} icon={BanknotesIcon} colorClass="bg-emerald-500" />
        <StatCard title="لغو شده" value={stats.cancelled.toLocaleString('fa-IR')} icon={XCircleIcon} colorClass="bg-red-500" />
      </div>

      {/* 3. Toolbar & Bulk Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center min-h-[76px]">
        
        {selectedIds.size > 0 ? (
          // Bulk Actions Toolbar (Active State)
          <div className="w-full flex items-center justify-between animate-fade-in bg-blue-50 p-2 rounded-xl border border-blue-100">
             <div className="flex items-center gap-3">
               <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-sm">
                 {selectedIds.size} انتخاب شده
               </span>
               <button 
                 onClick={() => setSelectedIds(new Set())}
                 className="text-gray-500 hover:text-gray-700 text-sm"
               >
                 لغو
               </button>
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setIsBulkStatusModalOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg text-sm font-bold transition-colors"
               >
                 <CheckCircleIcon className="w-5 h-5" />
                 تغییر وضعیت
               </button>
               <button 
                 onClick={handleBulkDelete}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
               >
                 <TrashIcon className="w-5 h-5" />
                 حذف
               </button>
             </div>
          </div>
        ) : (
          // Default Toolbar
          <>
            <div className="relative w-full lg:w-96">
              <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="جستجو در نام کاربر، آدرس، شناسه..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-accent focus:border-accent block pr-10 pl-2.5 py-2.5 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
               <div className="relative">
                 <select 
                   value={statusFilter}
                   onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                   className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pr-4 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium cursor-pointer"
                 >
                   <option value="">همه وضعیت‌ها</option>
                   <option value="pending">در انتظار</option>
                   <option value="confirmed">تایید شده</option>
                   <option value="processing">در حال پردازش</option>
                   <option value="shipped">ارسال شده</option>
                   <option value="delivered">تحویل شده</option>
                   <option value="cancelled">لغو شده</option>
                 </select>
                 <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
               </div>

               <div className="relative">
                 <select 
                   value={ordering}
                   onChange={(e) => setOrdering(e.target.value)}
                   className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pr-4 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium cursor-pointer"
                 >
                   <option value="-order_date">جدیدترین</option>
                   <option value="order_date">قدیمی‌ترین</option>
                   <option value="-total_amount">گران‌ترین</option>
                 </select>
                 <ArrowPathIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
               </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-gray-400 text-sm">در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size > 0 && selectedIds.size === filteredOrders.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">شناسه</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">مشتری</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">وضعیت</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">تاریخ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">مبلغ کل</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.has(order.id) ? 'bg-blue-50/60' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(order.id)}
                          onChange={() => handleSelectRow(order.id)}
                          className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{order.username}</span>
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">{order.shipping_address || 'بدون آدرس'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} display={order.status_display} /></td>
                      <td className="px-6 py-4 text-sm text-gray-600 dir-ltr">{formatDate(order.order_date)}</td>
                      <td className="px-6 py-4 font-bold text-primary text-sm">{formatPrice(order.total_amount)} <span className="text-xs text-gray-400">تومان</span></td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => navigate(`/admin/orders/view/${order.id}`)}
                          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-accent-hover hover:bg-yellow-50 rounded-lg font-bold text-xs"
                        >
                          <EyeIcon className="w-4 h-4" /> جزئیات
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && paginatedOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, filteredOrders.length)} از {filteredOrders.length}
            </span>
            <div className="flex gap-1">
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50">قبلی</button>
               <span className="px-3 py-1 bg-primary text-white rounded-lg font-bold">{currentPage}</span>
               <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 rounded-lg border bg-white disabled:opacity-50">بعدی</button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Status Update Modal */}
      {isBulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">تغییر وضعیت گروهی</h3>
              <button onClick={() => setIsBulkStatusModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                وضعیت جدید را برای <strong>{selectedIds.size}</strong> سفارش انتخاب شده تعیین کنید:
              </p>
              <select 
                 value={bulkStatusTarget}
                 onChange={(e) => setBulkStatusTarget(e.target.value)}
                 className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
              >
                 <option value="pending">در انتظار</option>
                 <option value="confirmed">تایید شده</option>
                 <option value="processing">در حال پردازش</option>
                 <option value="shipped">ارسال شده</option>
                 <option value="delivered">تحویل شده</option>
                 <option value="cancelled">لغو شده</option>
              </select>
              <div className="flex gap-3 mt-6">
                 <button onClick={() => setIsBulkStatusModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-bold">انصراف</button>
                 <button onClick={handleBulkStatusUpdate} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">تایید نهایی</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersDashboard;