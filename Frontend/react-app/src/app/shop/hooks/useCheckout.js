import { useState, useEffect } from "react";
import { CheckoutApi } from "../api/CheckoutApi";
import { handleApiError } from "@/utils/errorHandler";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

export const useCheckout = () => {
  const [checkoutData, setCheckoutData] = useState(null); // آدرس‌ها و اطلاعات
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { fetchCart } = useCart(); // برای رفرش کردن سبد بعد از خرید

  // دریافت اطلاعات اولیه به محض ورود به صفحه
  useEffect(() => {
    const init = async () => {
      try {
        const data = await CheckoutApi.getCheckoutInfo();
        setCheckoutData(data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const submitOrder = async (selectedAddressId, paymentType) => {
    if (!selectedAddressId) {
      return { success: false, message: "لطفاً یک آدرس را انتخاب کنید." };
    }

    setSubmitting(true);
    try {
      await CheckoutApi.submitOrder({
        address_id: selectedAddressId,
        payment_type: paymentType
      });
      
      // موفقیت
      await fetchCart(); // سبد خالی میشه، باید آپدیت کنیم
      navigate("/profile"); // یا صفحه موفقیت پرداخت
      return { success: true, message: "سفارش با موفقیت ثبت شد." };
      
    } catch (err) {
      return { success: false, message: handleApiError(err) };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    checkoutData,
    loading,
    submitting,
    error,
    submitOrder
  };
};