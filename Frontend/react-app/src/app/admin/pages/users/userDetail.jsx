// src/app/admin/pages/users/UserDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserById } from "@/app/admin/api/UsersApi";
import LoadingSpinner from "@/components/LoadingSpinner";

// Icons
import { 
  ArrowRightIcon, UserIcon, MapPinIcon, ShoppingBagIcon, 
  EnvelopeIcon, PhoneIcon, ShieldCheckIcon, CalendarDaysIcon,
  CheckCircleIcon, XCircleIcon, CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. دریافت اطلاعات کاربر + سفارشات
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        console.error(err);
        alert("خطا در دریافت اطلاعات کاربر");
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, navigate]);

  // فرمت کردن قیمت
  const formatPrice = (price) => Number(price).toLocaleString("fa-IR");
  
  // فرمت کردن تاریخ
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("fa-IR", {
      year: "numeric", month: "long", day: "numeric", 
      hour: "2-digit", minute: "2-digit"
    });
  };

  // رنگ وضعیت سفارش
  const getStatusBadge = (status, display) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      sent: "bg-indigo-100 text-indigo-700",
      delivered: "bg-emerald-100 text-emerald-700",
      canceled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {display || status}
      </span>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!user) return null;

  return (
    <div className="pb-20 animate-fade-in max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
           <ArrowRightIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            پروفایل کاربر <span className="text-primary font-mono text-xl">#{user.id}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">مشاهده اطلاعات، آدرس‌ها و سوابق خرید</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile & Info (1 Col) */}
        <div className="space-y-6">
            
            {/* 1. Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="h-24 bg-gradient-to-r from-primary to-primary-light"></div>
                <div className="px-6 pb-6 text-center -mt-12">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 mx-auto overflow-hidden shadow-md flex items-center justify-center">
                        {user.photo ? (
                            <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                    
                    <h2 className="mt-3 font-bold text-lg text-gray-800">{user.username}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>

                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                        {user.is_superuser && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <ShieldCheckIcon className="w-3 h-3" /> مدیر کل
                            </span>
                        )}
                        {user.is_staff && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">ادمین</span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {user.is_active ? <CheckCircleIcon className="w-3 h-3"/> : <XCircleIcon className="w-3 h-3"/>}
                            {user.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-accent" /> اطلاعات تماس
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-mono">{user.email || '---'}</span>
                    </div>
                    {/* اگر شماره تماس در آبجکت کاربر بود اینجا اضافه کن */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-mono">{user.phone || 'شماره ثبت نشده'}</span>
                    </div>
                </div>
            </div>

            {/* 3. Addresses */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-accent" /> آدرس‌ها
                </h3>
                {user.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-4">
                        {user.addresses.map((addr) => (
                            <div key={addr.id} className="text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                                <p className="font-bold text-gray-700 mb-1">{addr.province} - {addr.city}</p>
                                <p className="text-gray-500 leading-relaxed text-xs">{addr.street} {addr.detail} پلاک {addr.postal_code}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-xs text-gray-400 py-4 border-2 border-dashed border-gray-100 rounded-xl">
                        هیچ آدرسی ثبت نشده است.
                    </p>
                )}
            </div>

        </div>

        {/* Right Column: Order History (2 Cols) */}
        <div className="lg:col-span-2">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-primary" /> تاریخچه سفارشات
                    </h3>
                    <span className="text-xs bg-white border px-2 py-1 rounded-lg text-gray-500 font-mono">
                        {user.orders ? user.orders.length : 0} سفارش
                    </span>
                </div>
                
                {user.orders && user.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">شماره سفارش</th>
                                    <th className="px-6 py-3 font-medium">تاریخ</th>
                                    <th className="px-6 py-3 font-medium">مبلغ کل</th>
                                    <th className="px-6 py-3 font-medium text-center">وضعیت</th>
                                    <th className="px-6 py-3 font-medium">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {user.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-700">#{order.id}</span>
                                            <div className="text-xs text-gray-400 mt-1">{order.payment_type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <CalendarDaysIcon className="w-4 h-4 text-gray-300" />
                                                {formatDate(order.order_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-bold text-gray-800 text-sm">
                                                {formatPrice(order.total_amount)} 
                                                <span className="text-[10px] font-normal text-gray-500">تومان</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(order.status, order.status_display)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                to={`/admin/orders/view/${order.id}`}
                                                className="text-accent-hover hover:text-primary font-bold text-xs flex items-center gap-1 transition-colors"
                                            >
                                                مشاهده فاکتور <ArrowRightIcon className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <ShoppingBagIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p>هنوز هیچ سفارشی ثبت نشده است.</p>
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetail;