import React, { useState } from "react";
import { useCheckout } from "../../hooks/useCheckout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  MapPinIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

const CheckoutPage = () => {
  const { checkoutData, loading, submitting, submitOrder, error } = useCheckout();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentType, setPaymentType] = useState('cash'); // cash or online

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const handleFinish = async () => {
    const res = await submitOrder(selectedAddress, paymentType);
    if(res.success) {
        alert("سفارش با موفقیت ثبت شد!"); // بعدا به صفحه موفقیت هدایت میشه
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="pb-32 p-4 animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-6">نهایی کردن سفارش</h1>

      {/* 1. Address Selection */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-accent" /> انتخاب آدرس ارسال
        </h2>
        
        <div className="space-y-3">
            {checkoutData.addresses.map((addr) => (
                <div 
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                        selectedAddress === addr.id 
                        ? 'border-accent bg-accent/5' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <p className="font-bold text-gray-800 text-sm mb-1">{addr.province} - {addr.city}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{addr.detail} (پلاک {addr.postal_code})</p>
                    
                    {selectedAddress === addr.id && (
                        <div className="absolute top-3 left-3 bg-accent text-primary rounded-full p-1">
                            <CheckCircleIcon className="w-4 h-4" />
                        </div>
                    )}
                </div>
            ))}
            {checkoutData.addresses.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                    آدرسی یافت نشد. لطفاً در پروفایل آدرس اضافه کنید.
                </div>
            )}
        </div>
      </section>

      {/* 2. Payment Method */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-accent" /> شیوه پرداخت
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => setPaymentType('online')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentType === 'online' ? 'border-primary bg-primary text-white' : 'border-gray-100 bg-white text-gray-500'
                }`}
            >
                <CreditCardIcon className="w-8 h-8" />
                <span className="text-sm font-bold">پرداخت آنلاین</span>
            </button>
            <button 
                onClick={() => setPaymentType('cash')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentType === 'cash' ? 'border-primary bg-primary text-white' : 'border-gray-100 bg-white text-gray-500'
                }`}
            >
                <BanknotesIcon className="w-8 h-8" />
                <span className="text-sm font-bold">پرداخت در محل</span>
            </button>
        </div>
      </section>

      {/* 3. Summary & Submit */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
         <div className="flex justify-between mb-2 text-sm text-gray-600">
            <span>مبلغ کل کالاها</span>
            <span>{Number(checkoutData.cart_total).toLocaleString()} تومان</span>
         </div>
         <div className="flex justify-between mb-4 text-sm text-gray-600">
            <span>هزینه ارسال</span>
            <span>رایگان</span>
         </div>
         <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
            <span className="font-bold text-gray-800">مبلغ قابل پرداخت</span>
            <span className="font-black text-xl text-primary">{Number(checkoutData.cart_total).toLocaleString()} <span className="text-xs font-normal">تومان</span></span>
         </div>

         <button 
            onClick={handleFinish}
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center gap-2"
         >
            {submitting ? <LoadingSpinner className="w-5 h-5 text-white" /> : <CheckCircleIcon className="w-6 h-6" />}
            {submitting ? "در حال پردازش..." : "تایید و پرداخت"}
         </button>
      </div>

    </div>
  );
};

export default CheckoutPage;