import React, { createContext, useContext, useState, useEffect } from "react";
import { CartApi } from "../app/shop/api/CartApi";
import { useShopAuth } from "./ShopAuthContext";
import { handleApiError } from "../utils/errorHandler";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useShopAuth();
  
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0); // شمارنده برای بج
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // برای لودینگ‌های کوچک دکمه‌ها

  // دریافت اولیه سبد خرید وقتی کاربر لاگین می‌کند
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return;
    }

    setLoading(true);
    try {
      const data = await CartApi.getCart();
      setCart(data);
      updateCartCount(data);
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // محاسبه تعداد آیتم‌ها
  const updateCartCount = (cartData) => {
    if (cartData && cartData.items) {
      // اگر تعداد تنوع مهم است: cartData.items.length
      // اگر تعداد کل کالاها مهم است (مثلا ۵ تا از یک کالا)، باید لوپ بزنید. فعلا length:
      setCartCount(cartData.items.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // --- عملیات‌ها ---

  const addToCart = async (productId) => {
    if (!isAuthenticated) return { success: false, message: "لطفاً ابتدا وارد شوید." };
    
    setIsUpdating(true);
    try {
      const res = await CartApi.addToCart(productId);
      // آپدیت سریع استیت بدون رفرش کل صفحه (اگر بکند کل سبد را برگرداند عالی است، اگر نه دوباره فچ میکنیم)
      // فرض میکنیم بکند سبد جدید یا آیتم جدید را برمیگرداند. برای اطمینان فچ میکنیم:
      await fetchCart(); 
      return { success: true, message: "به سبد خرید اضافه شد" };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setIsUpdating(true);
    try {
      await CartApi.removeItem(itemId);
      // آپتیمیستیک آپدیت (Optimistic Update) برای سرعت بالا:
      // یعنی قبل از اینکه سرور جواب بده، از UI حذفش میکنیم تا کاربر حس سرعت کنه
      if (cart && cart.items) {
          const newItems = cart.items.filter(item => item.id !== itemId);
          setCart({ ...cart, items: newItems });
          updateCartCount({ ...cart, items: newItems });
      }
      
      // محض اطمینان بعدش سینک میکنیم
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("آیا از خالی کردن سبد خرید مطمئن هستید؟")) return;
    
    setIsUpdating(true);
    try {
      await CartApi.clearCart();
      setCart({ ...cart, items: [], total_price: 0 });
      setCartCount(0);
      return { success: true };
    } catch (error) {
      return { success: false, message: handleApiError(error) };
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartCount, 
      loading, 
      isUpdating, 
      fetchCart, 
      addToCart, 
      removeFromCart, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);