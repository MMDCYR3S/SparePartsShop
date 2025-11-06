# serializers.py
from rest_framework import serializers

from apps.accounts.models import Address
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment, PaymentType

# ========= Checkout Serializer ========= #
class CheckoutSerializer(serializers.Serializer):
    """سریالایزر برای فرآیند تسویه حساب"""
    address_id = serializers.IntegerField(write_only=True)
    payment_type = serializers.ChoiceField(choices=PaymentType.choices)
    
    def validate_address_id(self, value):
        """بررسی می‌کند که آیا آدرس متعلق به کاربر فعلی است یا خیر"""
        user = self.context['request'].user
        try:
            # اطمینان از اینکه آدرس وجود دارد و به کاربر تعلق دارد
            address = Address.objects.get(id=value, user=user)
            return value
        except Address.DoesNotExist:
            raise serializers.ValidationError("آدرس انتخاب شده معتبر نیست یا متعلق به شما نیست.")

# ========= Order Item Serializer ======== #
class OrderItemSerializer(serializers.ModelSerializer):
    """سریالایزر برای آیتم‌های سفارش"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_brand', 'quantity', 'price_at_time_of_purchase']

# ========= Order Serializer ======== #
class OrderSerializer(serializers.ModelSerializer):
    """سریالایزر برای سفارش"""
    items = OrderItemSerializer(many=True, read_only=True)
    payment_type = serializers.CharField(write_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'order_date', 'shipping_address', 'total_amount', 'items', 'payment_type']
        read_only_fields = ['user', 'status', 'order_date', 'total_amount']

# ========= Payment Serializer ========= #
class PaymentSerializer(serializers.ModelSerializer):
    """سریالایزر برای پرداخت"""
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'payment_type', 'payment_type_display', 'status', 'status_display', 'transaction_id']
        read_only_fields = ['order', 'status']

# ======== Address Serializer ======== #
class AddressSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل آدرس"""
    class Meta:
        model = Address
        fields = ['id', 'province', 'city', 'street', 'postal_code', 'detail']

