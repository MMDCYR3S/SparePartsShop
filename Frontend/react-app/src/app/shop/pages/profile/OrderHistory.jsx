// src/app/shop/pages/profile/OrderHistory.jsx
import React, { useEffect } from "react";
import { useCustomer } from "@/app/shop/hooks/useCustomer";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, Calendar, ChevronDown } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const OrderHistory = () => {
  const { orders, fetchOrders, loadingOrders } = useCustomer();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
        case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-amber-100 text-amber-700 border-amber-200'; // pending
    }
  };

  const getStatusText = (status) => {
    const map = {
        pending: 'در انتظار', confirmed: 'تایید شده', processing: 'در حال پردازش',
        shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده'
    };
    return map[status] || status;
  };

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <ArrowRight size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-800">سوابق سفارش</h1>
      </div>

      {loadingOrders ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={64} className="mb-4 opacity-20" />
            <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    
                    {/* Header: ID & Status */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs text-gray-400 block mb-1">کد سفارش</span>
                            <span className="font-mono font-black text-lg text-gray-800">#{order.id}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="bg-gray-50 rounded-2xl p-3 mb-4 space-y-2">
                        {order.order_items?.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate max-w-[70%]">{item.product.name}</span>
                                <span className="font-bold text-gray-800">x{1}</span>
                            </div>
                        ))}
                        {order.order_items?.length > 3 && (
                            <p className="text-xs text-gray-400 text-center pt-1">+ {order.order_items.length - 3} محصول دیگر</p>
                        )}
                    </div>

                    {/* Footer: Date & Total */}
                    <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar size={14} />
                            <span>{new Date(order.order_date).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="text-left">
                            <span className="text-xs text-gray-400 block">مبلغ کل</span>
                            <span className="font-black text-primary text-lg">
                                {Number(order.total_amount).toLocaleString()} <span className="text-xs font-normal">تومان</span>
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;