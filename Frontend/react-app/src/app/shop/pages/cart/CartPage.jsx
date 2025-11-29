import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { TrashIcon, ArrowRightIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/LoadingSpinner";

const CartPage = () => {
  const { cart, loading, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (!cart || cart.items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-fade-in">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">سبد خرید خالی است</h2>
            <p className="text-gray-500 mb-8 text-sm">شما هنوز هیچ محصولی را به سبد خرید خود اضافه نکرده‌اید.</p>
            <Link to="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-all active:scale-95">
                مشاهده محصولات
            </Link>
        </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800">سبد خرید</h1>
        <button onClick={clearCart} className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
            حذف همه
        </button>
      </div>

      <div className="space-y-4">
        {cart.items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition-all hover:shadow-md">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 p-2 overflow-hidden">
                    <img src={item.product.main_image || item.product.images?.[0]?.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.product.part_code}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-primary text-sm">{Number(item.total_price).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">تومان</span></span>
                        
                        {/* Remove Btn */}
                        <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="fixed bottom-0 pb-24 md:bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 pb-safe">
         <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-500">مجموع قابل پرداخت:</span>
                <span className="font-black text-xl text-primary">{Number(cart.total_price).toLocaleString()} <span className="text-xs font-normal text-gray-400">تومان</span></span>
            </div>
            
            <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 flex justify-between items-center px-6"
            >
                <span>ادامه و تسویه حساب</span>
                <ArrowRightIcon className="w-5 h-5 rotate-180" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default CartPage;