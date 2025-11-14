from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment, PaymentStatus, PaymentType
from drf_spectacular.utils import extend_schema

from .serializers import (
    OrderSerializer,
    PaymentSerializer,
    CheckoutSerializer,
)
from apps.carts.models import Cart, CartItem
from apps.accounts.models import Address, Profile
from .serializers import AddressSerializer

# ========== Checkout View ========== #
@extend_schema(tags=["Checkout"])
class CheckoutView(GenericAPIView):
    """نمایش خلاصه سفارش و ایجاد سفارش نهایی با انتخاب آدرس"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CheckoutSerializer
    
    def get(self, request):
        """نمایش خلاصه سبد خرید و لیست آدرس‌های کاربر برای تسویه حساب"""
        cart = get_object_or_404(Cart, user=request.user)
        
        if not cart.items.exists():
            return Response(
                {"error": "سبد خرید شما خالی است."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # دریافت آدرس‌های کاربر
        addresses = Address.objects.filter(user=request.user)
        address_serializer = AddressSerializer(addresses, many=True)
        
        # محاسبه مجموع قیمت
        total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
        
        # آماده‌سازی داده‌ها برای نمایش
        cart_data = {
            "items": [
                {
                    "id": item.id,
                    "product": {
                        "id": item.product.id,
                        "name": item.product.name,
                        "brand": item.product.brand,
                        "price": item.product.price,
                    },
                    "quantity": item.quantity,
                    "total_price": item.product.price * item.quantity
                }
                for item in cart.items.all()
            ],
            "total_amount": total_amount,
            "addresses": address_serializer.data  # اضافه کردن آدرس‌ها به پاسخ
        }
        
        return Response(cart_data)
    
    def post(self, request):
        """ایجاد سفارش نهایی از سبد خرید با استفاده از آدرس انتخاب شده"""
        cart = get_object_or_404(Cart, user=request.user)
        
        if not cart.items.exists():
            return Response(
                {"error": "سبد خرید شما خالی است."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            address_id = serializer.validated_data['address_id']
            payment_type = serializer.validated_data['payment_type']
            
            # دریافت آدرس انتخاب شده
            address = get_object_or_404(Address, id=address_id, user=request.user)
            
            # ساخت رشته آدرس کامل برای ذخیره در مدل Order
            shipping_address = (
                f"{address.province}, {address.city}, {address.street}, "
                f"کد پستی: {address.postal_code}\n{address.detail}"
            )
            
            # محاسبه مجموع قیمت
            total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
            
            try:
                with transaction.atomic():
                    # ایجاد سفارش
                    order = Order.objects.create(
                        user=request.user,
                        shipping_address=shipping_address,
                        total_amount=total_amount,
                        payment_type=payment_type
                    )
                    
                    # ایجاد آیتم‌های سفارش و کاهش موجودی
                    for cart_item in cart.items.all():
                        OrderItem.objects.create(
                            order=order,
                            product=cart_item.product,
                            quantity=cart_item.quantity,
                            price_at_time_of_purchase=cart_item.product.price
                        )
                        product = cart_item.product
                        product.stock_quantity -= cart_item.quantity
                        product.save()
                    
                    # خالی کردن سبد خرید
                    cart.items.all().delete()
                    
                    payment = Payment.objects.get(order=order)
                    
                    # آماده‌سازی پاسخ
                    response_data = {
                        "order": OrderSerializer(order).data,
                        "payment": PaymentSerializer(payment).data,
                        "message": "سفارش شما با موفقیت ثبت شد."
                    }
                    
                    # اگر پرداخت نقدی است، اطلاعات کارت را اضافه کن
                    if payment_type == PaymentType.CASH:
                        response_data["card_info"] = {
                            "card_number": "1234-5678-9012-3456",
                            "card_holder": "نام صاحب کارت",
                            "bank": "نام بانک"
                        }
                        response_data["next_step"] = "لطفاً تصویر تراکنش را آپلود کنید."
                    else:
                        response_data["next_step"] = "تیم ما به زودی با شما تماس خواهد گرفت."
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                return Response(
                    {"error": f"خطا در ایجاد سفارش: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
