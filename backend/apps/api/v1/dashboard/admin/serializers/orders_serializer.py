from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model

from apps.orders.models import Order, OrderItem, OrderStatus
from apps.shop.models import Product
from apps.payments.models import Payment

User = get_user_model()

# ========= Simple Product Serializer ======== #
class SimpleProductSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش اطلاعات محصول در آیتم سفارش"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'part_code', 'price']

# ========= OrderItem Serializer ======== #
class OrderItemSerializer(serializers.ModelSerializer):
    """سریالایزر برای آیتم‌های سفارش"""
    product = SimpleProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'price_at_time_of_purchase']
        read_only_fields = ['price_at_time_of_purchase']

# ========= Payment Serializer ========= #
class PaymentSerializer(serializers.ModelSerializer):
    """سریالایزر برای نمایش اطلاعات پرداخت"""
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'payment_type', 'payment_type_display', 'status', 'status_display', 'transaction_id']
        read_only_fields = ['payment_type', 'status', 'transaction_id']

# ========== Order Management Serializer ========== #
class OrderManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر اصلی برای مدیریت کامل سفارش‌ها توسط ادمین.
    """
    # نمایش اطلاعات مرتبط
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # فیلدها برای ورود اطلاعات هنگام ایجاد/ویرایش
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    items_data = OrderItemSerializer(many=True, write_only=True, source='items')

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'status', 'status_display', 'order_date', 
            'shipping_address', 'total_amount', 'items', 'items_data', 'payment'
        ]
        read_only_fields = ['total_amount', 'order_date']

    def validate(self, data):
        """بررسی می‌کند که حداقل یک آیتم در سفارش وجود داشته باشد."""
        items = data.get('items', [])
        if not items:
            raise serializers.ValidationError("یک سفارش باید حداقل شامل یک آیتم باشد.")
        return data

    @transaction.atomic
    def create(self, validated_data):
        """سفارش و آیتم‌های آن را به صورت یکپارچه ایجاد می‌کند."""
        items_data = validated_data.pop('items')
        
        order = Order.objects.create(**validated_data)
        
        total_amount = 0
        
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            price_at_time = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                price_at_time_of_purchase=price_at_time
            )

            product.save()
            
            total_amount += price_at_time
        
        # به‌روزرسانی مبلغ کل سفارش
        order.total_amount = total_amount
        order.save()
        
        return order

    @transaction.atomic
    def update(self, instance, validated_data):
        """سفارش و آیتم‌های آن را به صورت یکپارچه ویرایش می‌کند."""
        items_data = validated_data.pop('items', None)
        
        # به‌روزرسانی فیلدهای اصلی سفارش
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        
        if items_data is not None:
            # بازگرداندن موجودی قدیمی محصول
            old_items = instance.items.all()
            for item in old_items:
                item.product.save()
            
            # ایجاد آیتم‌های جدید
            total_amount = 0
            for item_data in items_data:
                product = Product.objects.get(id=item_data['product_id'])
                price_at_time = product.price
                
                OrderItem.objects.create(
                    order=instance,
                    product=product,
                    price_at_time_of_purchase=price_at_time
                )
                
                product.save()
                
                total_amount += price_at_time
            
            # به‌روزرسانی مبلغ کل سفارش
            instance.total_amount = total_amount
            instance.save()
            
        return instance
    