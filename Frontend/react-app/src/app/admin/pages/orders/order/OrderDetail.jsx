import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getOrderById, 
  patchOrder, 
  deleteOrder 
} from '@/app/admin/api/OrdersApi';

// Icons
import { 
  ArrowRightIcon, 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CreditCardIcon, 
  CalendarIcon, 
  PrinterIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '@/components/LoadingSpinner';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==================== States ====================
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status Steps for Timeline
  const steps = [
    { key: 'pending', label: 'در انتظار', icon: ClockIcon },
    { key: 'confirmed', label: 'تایید شده', icon: CheckCircleIcon },
    { key: 'processing', label: 'در حال پردازش', icon: ArchiveBoxIcon },
    { key: 'shipped', label: 'ارسال شده', icon: TruckIcon },
    { key: 'delivered', label: 'تحویل شده', icon: MapPinIcon },
  ];

  // ==================== Fetch Data ====================
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      alert(err.message);
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ==================== Handlers ====================
  
const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`آیا وضعیت سفارش به "${newStatus}" تغییر کند؟`)) return;
    
    setUpdating(true);
    try {
      // 💡 راه حل: بازسازی دیتای آیتم‌ها برای راضی کردن بکند
      // بکند انتظار داره items_data رو بگیره (طبق داکیومنت Swagger برای PUT/POST)
      // پس ما همونو براش میفرستیم، حتی تو PATCH
      
      const itemsPayload = order.items.map(item => ({
        product_id: item.product.id,
        // اگر تعداد یا قیمت هم لازم بود اینجا اضافه میکنیم، ولی طبق داکیومنت فقط product_id کافیه
        // اما چون این PATCH هست، ممکنه فقط product_id کافی باشه.
      }));

      const payload = { 
        status: newStatus,
        // این خط رو اضافه میکنیم تا ارور "حداقل یک آیتم" رفع بشه:
        items_data: itemsPayload 
      };

      console.log("Sending Payload:", payload); // برای دیباگ

      const updatedOrder = await patchOrder(id, payload);
      setOrder(updatedOrder);
      // alert('وضعیت سفارش آپدیت شد');

    } catch (err) {
      console.error("Update Error:", err);
      // نمایش ارور به کاربر
      if (err.response && err.response.data) {
         const serverError = err.response.data;
         const msg = serverError.non_field_errors ? serverError.non_field_errors[0] : JSON.stringify(serverError);
         alert(`خطای سرور: ${msg}`);
      } else {
         alert('خطا در تغییر وضعیت: ' + err.message);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('هشدار: حذف سفارش غیرقابل بازگشت است. ادامه میدهید؟')) return;
    try {
      await deleteOrder(id);
      navigate('/admin/orders');
    } catch (err) {
      alert('خطا در حذف سفارش.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ==================== Helpers ====================
  const formatPrice = (p) => Number(p).toLocaleString('fa-IR');
  
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === order.status);
  };

  // ==================== Render ====================
  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!order) return null;

  return (
    <div className="space-y-6 pb-20 animate-fade-in print:p-0 print:bg-white">
      {/* 1. Header Navigation (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              سفارش <span className="font-mono text-primary">#{order.id}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ثبت شده در {new Date(order.order_date).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors"
          >
            <PrinterIcon className="w-5 h-5" />
            چاپ فاکتور
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            حذف
          </button>
        </div>
      </div>

      {/* 2. Status Timeline (Visual Stepper) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden overflow-x-auto" dir='ltr'>
         {order.status === 'cancelled' ? (
           <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
             <TrashIcon className="w-6 h-6" />
             این سفارش لغو شده است.
           </div>
         ) : (
           <div className="flex items-center justify-between min-w-[600px]">
             {steps.map((step, index) => {
               const isActive = index <= getCurrentStepIndex();
               const isCurrent = index === getCurrentStepIndex();
               
               return (
                 <div key={step.key} className="flex flex-col items-center relative flex-1 group">
                    {/* Line */}
                    {index !== 0 && (
                      <div className={`absolute top-5 right-1/2 w-full h-1 -translate-y-1/2 transition-colors duration-500 ${isActive ? 'bg-primary' : 'bg-gray-200'}`} style={{right: '50%'}} />
                    )}
                    
                    {/* Circle */}
                    <div 
                      onClick={() => handleStatusChange(step.key)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all cursor-pointer ${
                        isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'scale-110 ring-4 ring-primary/20' : ''}`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    
                    {/* Label */}
                    <span className={`mt-3 text-xs font-bold transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                 </div>
               );
             })}
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Main Content: Order Items (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-800">اقلام سفارش ({order.items.length})</h3>
             </div>
             
             <div className="divide-y divide-gray-100">
               {order.items.map((item) => (
                 <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                       <ArchiveBoxIcon className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{item.product.part_code}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                       <p className="text-xs text-gray-500">قیمت واحد (زمان خرید)</p>
                       <p className="font-bold text-primary">{formatPrice(item.price_at_time_of_purchase)} <span className="text-xs font-normal">تومان</span></p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* 4. Sidebar: Info Cards (1 col) */}
        <div className="space-y-6">
          
          {/* Status Change (Manual Dropdown) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <label className="text-sm font-bold text-gray-500 mb-2 block">تغییر وضعیت دستی</label>
             <div className="relative">
               <select 
                 value={order.status}
                 onChange={(e) => handleStatusChange(e.target.value)}
                 disabled={updating}
                 className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-3 pr-4 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent font-bold cursor-pointer"
               >
                 <option value="pending">در انتظار (Pending)</option>
                 <option value="confirmed">تایید شده (Confirmed)</option>
                 <option value="processing">در حال پردازش (Processing)</option>
                 <option value="shipped">ارسال شده (Shipped)</option>
                 <option value="delivered">تحویل شده (Delivered)</option>
                 <option value="cancelled">لغو شده (Cancelled)</option>
               </select>
               <div className="absolute left-3 top-3.5 pointer-events-none">
                 {updating ? <LoadingSpinner className="w-5 h-5" /> : <ArrowRightIcon className="w-5 h-5 -rotate-90 text-gray-400" />}
               </div>
             </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <UserIcon className="w-5 h-5 text-accent" />
               اطلاعات مشتری
             </h3>
             <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mt-1">
                   {order.username ? order.username.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-800">{order.username || 'کاربر مهمان'}</p>
                   <p className="text-xs text-gray-400">شناسه کاربر: {order.user}</p>
                 </div>
               </div>
               
               <div className="border-t border-gray-100 pt-3 space-y-3">
                 <div className="flex gap-2 text-sm text-gray-600">
                   <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                   <p className="leading-relaxed">{order.shipping_address || 'آدرس ثبت نشده'}</p>
                 </div>
                 <div className="flex gap-2 text-sm text-gray-600">
                   <PhoneIcon className="w-5 h-5 text-gray-400" />
                   <p>09123456789 (فرضی)</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
               <CreditCardIcon className="w-5 h-5 text-emerald-500" />
               اطلاعات پرداخت
             </h3>
             
             <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">مبلغ کل سفارش</span>
                 <span className="font-black text-gray-800">{formatPrice(order.total_amount)} تومان</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">روش پرداخت</span>
                 <span className="font-medium text-gray-800">{order.payment?.payment_type_display || 'نامشخص'}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-500">وضعیت پرداخت</span>
                 <span className={`font-bold px-2 py-0.5 rounded text-xs ${order.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                   {order.payment?.status_display || 'نامشخص'}
                 </span>
               </div>
               {order.payment?.transaction_id && (
                 <div className="bg-gray-50 p-2 rounded text-xs text-center font-mono text-gray-500 mt-2">
                   Trans ID: {order.payment.transaction_id}
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;