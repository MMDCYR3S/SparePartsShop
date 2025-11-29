# views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from apps.carts.models import Cart, CartItem
from apps.shop.models import Product
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, 
    UpdateCartItemSerializer, ProductSimpleSerializer
)

# =========== Cart View =========== #
@extend_schema(tags=['Cart'])
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
@extend_schema(tags=['Cart'])
class AddToCartView(GenericAPIView):
    """افزودن محصول به سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddToCartSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            
            product = get_object_or_404(Product, id=product_id)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            # بررسی وجود محصول در سبد خرید
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, 
                product=product,
            )
            
            if not created:
                cart_item.save()
            
            response_data = {
                "message": "محصول با موفقیت به سبد خرید اضافه شد.",
                "cart_item": CartItemSerializer(cart_item, context={'request': request}).data,
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========== Update Cart Item =========== #
@extend_schema(tags=['Cart'])
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
            cart_item.save()

            
            response_data = {
                "message": "تعداد محصول با موفقیت ویرایش شد.",
                "cart_item": CartItemSerializer(cart_item, context={'request': request}).data,
            }
            
            return Response(response_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========== Remove From Cart View =========== #
@extend_schema(tags=['Cart'])
class RemoveFromCartView(GenericAPIView):
    """حذف یک آیتم از سبد خرید"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)