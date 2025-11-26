// src/app/admin/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/DashboardApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  BanknotesIcon, UsersIcon, ShoppingCartIcon, CubeIcon, 
  ArrowTrendingUpIcon, ClockIcon, UserPlusIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardStats();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!data) return <div className="p-10 text-center">داده‌ای یافت نشد.</div>;

  // --- Helpers ---
  const formatPrice = (p) => Number(p).toLocaleString('fa-IR');
  const formatDate = (d) => new Date(d).toLocaleDateString('fa-IR');

  // --- Chart Data Preparation ---
  // 1. Order Status Distribution (Pie Chart)
  const orderChartData = [
    { name: 'تکمیل شده', value: data.order_stats.total_orders - data.order_stats.pending_orders - data.order_stats.cancelled_orders, color: '#10b981' }, // Green
    { name: 'در انتظار', value: data.order_stats.pending_orders, color: '#f59e0b' }, // Amber
    { name: 'لغو شده', value: data.order_stats.cancelled_orders, color: '#ef4444' }, // Red
  ].filter(item => item.value > 0);

  // 2. Users Distribution (Bar Chart)
  const userChartData = [
    { name: 'کل کاربران', count: data.user_stats.total_users },
    { name: 'خریداران', count: data.user_stats.total_buyers },
    { name: 'ادمین‌ها', count: data.user_stats.total_admins },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 1. Header & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">داشبورد مدیریت</h1>
          <p className="text-sm text-gray-500 mt-1">نمای کلی وضعیت فروشگاه در یک نگاه</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-600">
          <ClockIcon className="w-5 h-5 text-accent" />
          امروز: {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>
      {/* 2. Stats Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="فروش کل" 
          value={formatPrice(data.revenue_stats.total_revenue)} 
          unit="تومان"
          icon={BanknotesIcon} 
          color="bg-emerald-500" 
          subValue={`امروز: ${formatPrice(data.revenue_stats.today_revenue)}`}
        />
        <StatsCard 
          title="سفارشات" 
          value={data.order_stats.total_orders} 
          unit="عدد"
          icon={ShoppingCartIcon} 
          color="bg-blue-500" 
          subValue={`${data.order_stats.pending_orders} در انتظار بررسی`}
        />
        <StatsCard 
          title="کاربران" 
          value={data.user_stats.total_users} 
          unit="نفر"
          icon={UsersIcon} 
          color="bg-purple-500" 
          subValue={`${data.user_stats.total_buyers} خریدار فعال`}
        />
        <StatsCard 
          title="محصولات" 
          value={data.product_stats.total_products} 
          unit="قلم"
          icon={CubeIcon} 
          color="bg-orange-500" 
          subValue={`${data.product_stats.active_products} محصول فعال`}
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Orders Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-primary" /> وضعیت سفارشات
            </h3>
            <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={orderChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {orderChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatPrice(value)} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Users Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary" /> توزیع کاربران
            </h3>
            <div className="h-64 w-full text-xs" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 4. Recent Activity Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <ShoppingCartIcon className="w-5 h-5 text-blue-500" /> آخرین سفارشات
                  </h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs">
                          <tr>
                              <th className="px-5 py-3">کاربر</th>
                              <th className="px-5 py-3">مبلغ</th>
                              <th className="px-5 py-3">وضعیت</th>
                              <th className="px-5 py-3">تاریخ</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {data.recent_orders?.length === 0 ? (
                              <tr><td colSpan="4" className="p-4 text-center text-gray-400">موردی یافت نشد</td></tr>
                          ) : (
                              data.recent_orders?.slice(0, 5).map(order => (
                                  <tr key={order.id} className="hover:bg-gray-50/50">
                                      <td className="px-5 py-3 font-medium text-gray-700">{order.username}</td>
                                      <td className="px-5 py-3 font-bold text-gray-800">{formatPrice(order.total_amount)}</td>
                                      <td className="px-5 py-3">
                                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                              order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                              'bg-gray-100 text-gray-600'
                                          }`}>
                                              {order.status_display}
                                          </span>
                                      </td>
                                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(order.order_date)}</td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <UserPlusIcon className="w-5 h-5 text-purple-500" /> کاربران جدید
                  </h3>
              </div>
              <div className="divide-y divide-gray-50">
                  {data.recent_users?.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">کاربری یافت نشد</div>
                  ) : (
                      data.recent_users?.slice(0, 5).map(user => (
                          <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800 truncate">{user.username}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email || 'بدون ایمیل'}</p>
                              </div>
                              <div className="text-xs text-gray-400 whitespace-nowrap">
                                  {formatDate(user.created_date)}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

// --- Sub Component: Stats Card ---
const StatsCard = ({ title, value, unit, icon: Icon, color, subValue }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <p className="text-gray-500 text-sm font-bold mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-800">
                    {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
                </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-500 flex items-center gap-1">
                {subValue}
            </span>
        </div>
        {/* Background Decoration */}
        <Icon className="absolute -bottom-4 -left-4 w-24 h-24 text-gray-50 opacity-10 group-hover:scale-110 transition-transform z-0" />
    </div>
);

export default Dashboard;