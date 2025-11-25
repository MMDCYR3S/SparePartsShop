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
    id = serializers.IntegerField(required=False) 
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
        """
        مدیریت هوشمند آپدیت سفارش و آیتم‌های آن:
        1. آیتم‌های حذف شده از لیست ورودی -> حذف از دیتابیس
        2. آیتم‌های دارای ID -> آپدیت
        3. آیتم‌های بدون ID -> ایجاد
        """
        items_data = validated_data.pop('items', None)
        
        # ===== آپدیت سفارش های قبلی ===== #
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # ===== بررسی آیتم‌های جدید ===== #
        if items_data is None:
            return instance

        
        existing_item_ids = set(instance.items.values_list('id', flat=True))
        incoming_item_ids = set()
        
        total_amount = 0
        
        for item_data in items_data:
            item_id = item_data.get('id', None)
            product_id = item_data.get('product_id')
            
            if product_id:
                product = Product.objects.get(id=product_id)
                current_price = product.price
            
            if item_id and item_id in existing_item_ids:
                # --- حالت آپدیت (آیتم وجود دارد و ID ارسال شده) ---
                order_item = OrderItem.objects.get(id=item_id, order=instance)
                
                # اگر محصول تغییر کرده بود آپدیت کن
                if product_id:
                    order_item.product = product
                    order_item.price_at_time_of_purchase = current_price # قیمت جدید اعمال شود؟ (بستگی به بیزینس دارد)
                
                order_item.save()
                incoming_item_ids.add(item_id)
                
                # محاسبه مبلغ
                total_amount += order_item.price_at_time_of_purchase

            else:
                # --- حالت ایجاد (آیتم ID ندارد یا ID اشتباه است) ---
                new_item = OrderItem.objects.create(
                    order=instance,
                    product=product,
                    price_at_time_of_purchase=current_price
                )
                total_amount += new_item.price_at_time_of_purchase

        # 3. حالت حذف (آیتم در دیتابیس هست ولی در لیست ورودی نیست)
        # آیتم‌هایی که در دیتابیس بودند ولی ID آن‌ها در لیست ورودی جدید نیست
        items_to_delete_ids = existing_item_ids - incoming_item_ids
        if items_to_delete_ids:
            # اگر لاجیک خاصی برای بازگرداندن موجودی انبار دارید اینجا انجام دهید
            OrderItem.objects.filter(id__in=items_to_delete_ids).delete()

        # 4. آپدیت قیمت کل نهایی
        instance.total_amount = total_amount
        instance.save()
        
        return instance