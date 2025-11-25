// src/app/admin/pages/orders/new/OrderForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "@/app/admin/api/UsersApi";
import { createOrder } from "@/app/admin/api/OrdersApi";
import ProductSelector from "./components/ProductSelector";

// Icons
import { 
  UserIcon, TrashIcon, ShoppingCartIcon, ArrowRightIcon, 
  CalculatorIcon, CheckCircleIcon, MapPinIcon 
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

const OrderForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  
  // --- Form States ---
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [status, setStatus] = useState("pending");
  const [orderItems, setOrderItems] = useState([]); // [{ product, quantity, price }]

  // 1. دریافت کاربران
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers(); 
        setUsers(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("خطا در دریافت کاربران", err);
      }
    };
    fetchUsers();
  }, []);

  // 2. هندلرهای آیتم‌های سفارش
  const handleAddProduct = (product) => {
    const existingItemIndex = orderItems.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += 1;
      setOrderItems(newItems);
    } else {
      setOrderItems([
        ...orderItems, 
        { product: product, quantity: 1, price: parseInt(product.price) } // مطمئن میشیم قیمت عدد باشه
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty < 1) return;
    const newItems = [...orderItems];
    newItems[index].quantity = parseInt(newQty);
    setOrderItems(newItems);
  };

  // محاسبه مبلغ کل (برای نمایش و ارسال)
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 3. ثبت نهایی
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return alert("لطفاً مشتری را انتخاب کنید.");
    if (!shippingAddress.trim()) return alert("لطفاً آدرس ارسال را وارد کنید.");
    if (orderItems.length === 0) return alert("سبد خرید خالی است.");

    setSubmitting(true);
    try {
      const payload = {
        user: parseInt(selectedUserId),
        status: status,
        shipping_address: shippingAddress,
        total_amount: totalAmount, // <--- تغییر اصلی: ارسال مبلغ کل محاسبه شده
        items_data: orderItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      await createOrder(payload);
      alert("سفارش با موفقیت ثبت شد!");
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      if (err.type === 'VALIDATION_ERROR') {
        // هندل کردن ارورهای ولیدیشن خاص
        let errorMsg = "خطای اعتبارسنجی:\n";
        if (typeof err.details === 'object') {
           Object.entries(err.details).forEach(([key, val]) => {
             errorMsg += `- ${key}: ${Array.isArray(val) ? val.join(' ') : val}\n`;
           });
        } else {
           errorMsg += JSON.stringify(err.details);
        }
        alert(errorMsg);
      } else if (err.response && err.response.status === 500) {
        alert("خطای سرور (500). لطفاً با پشتیبانی فنی تماس بگیرید.");
      } else {
        alert("خطا در ثبت سفارش: " + (err.message || "ناشناخته"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
           <ArrowRightIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800">ثبت سفارش جدید</h1>
          <p className="text-sm text-gray-500 mt-1">ایجاد سفارش دستی برای مشتری</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Customer Selection & Address */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" /> مشخصات مشتری و ارسال
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">مشتری *</label>
                            <select 
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value="">-- انتخاب مشتری --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} {user.first_name ? `(${user.first_name} ${user.last_name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">وضعیت اولیه</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value="pending">در انتظار (Pending)</option>
                                <option value="confirmed">تایید شده (Confirmed)</option>
                                <option value="processing">در حال پردازش (Processing)</option>
                            </select>
                        </div>
                    </div>

                    {/* Shipping Address Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" /> آدرس ارسال *
                        </label>
                        <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows="2"
                            placeholder="آدرس دقیق پستی شامل استان، شهر، خیابان و پلاک..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none resize-none"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* 2. Order Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCartIcon className="w-5 h-5 text-primary" /> اقلام سفارش
                    </h3>
                    <span className="text-xs bg-white border px-2 py-1 rounded text-gray-600 font-mono">
                        {orderItems.length} آیتم
                    </span>
                </div>
                
                {orderItems.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400">
                        <ShoppingCartIcon className="w-16 h-16 mb-2 opacity-20" />
                        <p>هنوز محصولی اضافه نشده است.</p>
                        <p className="text-xs mt-1">از منوی سمت چپ (یا پایین) محصول اضافه کنید.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orderItems.map((item, index) => (
                            <div key={index} className="p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 w-full">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        <img src={item.product.images?.[0]?.image_url} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-gray-800 truncate">{item.product.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{item.product.part_code}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex items-center border border-gray-300 rounded-lg h-9">
                                        <button onClick={() => handleQuantityChange(index, item.quantity + 1)} className="px-3 hover:bg-gray-100 text-gray-600">+</button>
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            className="w-12 text-center text-sm font-bold border-x border-gray-300 h-full focus:outline-none"
                                        />
                                        <button onClick={() => handleQuantityChange(index, item.quantity - 1)} className="px-3 hover:bg-gray-100 text-gray-600">-</button>
                                    </div>
                                    <div className="text-left w-24">
                                        <p className="font-bold text-gray-800 text-sm">{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400">{item.price.toLocaleString()} واحد</p>
                                    </div>
                                    <button onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-2">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
            <ProductSelector onAddProduct={handleAddProduct} />

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CalculatorIcon className="w-5 h-5 text-accent" /> خلاصه فاکتور
                </h3>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>تعداد اقلام</span>
                        <span>{orderItems.reduce((acc, i) => acc + i.quantity, 0)} عدد</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">مبلغ قابل پرداخت</span>
                        <span className="font-black text-xl text-primary">{totalAmount.toLocaleString()} <span className="text-xs font-normal text-gray-500">تومان</span></span>
                    </div>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={submitting || orderItems.length === 0}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? <LoadingSpinner className="w-5 h-5 text-white" /> : <CheckCircleIcon className="w-6 h-6" />}
                    {submitting ? "در حال ثبت..." : "ثبت نهایی سفارش"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;