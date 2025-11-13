# views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from django.shortcuts import get_object_or_404

from apps.carts.models import Cart, CartItem
from apps.shop.models import Product
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, 
    UpdateCartItemSerializer, ProductSimpleSerializer
)

# =========== Cart View =========== #
class CartView(GenericAPIView):
    """نمایش و خالی کردن سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer
    def get(self, request):
        """نمایش سبد خرید کاربر"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request):
        """خالی کردن سبد خرید"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# =========== Add To Cart =========== #
class AddToCartView(GenericAPIView):
    """افزودن محصول به سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddToCartSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']
            
            product = get_object_or_404(Product, id=product_id)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            # بررسی وجود محصول در سبد خرید
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, 
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                # اگر محصول از قبل در سبد وجود داشته، تعداد را افزایش می‌دهیم
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock_quantity:
                    return Response(
                        {"error": (f"تعداد درخواستی بیشتر از موجودی محصول ({product.stock_quantity}) است.")},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.save()
            
            # بررسی اینکه آیا تعداد انتخابی معادل یک بسته کامل است
            is_package = cart_item.quantity >= product.package_quantity and cart_item.quantity % product.package_quantity == 0
            
            response_data = {
                "message": "محصول با موفقیت به سبد خرید اضافه شد.",
                "cart_item": CartItemSerializer(cart_item, context={'request': request}).data,
                "is_package": is_package,
                "package_info": {
                    "package_quantity": product.package_quantity,
                    "is_complete_package": is_package
                } if is_package else None
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========== Update Cart Item =========== #
class UpdateCartItemView(GenericAPIView):
    """ویرایش تعداد یک آیتم در سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpdateCartItemSerializer
    
    def patch(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        
        serializer = self.get_serializer(
            data=request.data, 
            context={'cart_item': cart_item}
        )
        
        if serializer.is_valid():
            cart_item.quantity = serializer.validated_data['quantity']
            cart_item.save()
            
            # بررسی اینکه آیا تعداد انتخابی معادل یک بسته کامل است
            is_package = cart_item.quantity >= cart_item.product.package_quantity and cart_item.quantity % cart_item.product.package_quantity == 0
            
            response_data = {
                "message": "تعداد محصول با موفقیت ویرایش شد.",
                "cart_item": CartItemSerializer(cart_item, context={'request': request}).data,
                "is_package": is_package,
                "package_info": {
                    "package_quantity": cart_item.product.package_quantity,
                    "is_complete_package": is_package
                } if is_package else None
            }
            
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========== Remove From Cart View =========== #
class RemoveFromCartView(GenericAPIView):
    """حذف یک آیتم از سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)