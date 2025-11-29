from rest_framework import serializers

from apps.accounts.models import Profile, Address
from apps.shop.models import Product
from apps.orders.models import Order, OrderItem

# ========= Profile Serializer ========= #
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True) 
    new_email = serializers.EmailField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Profile
        fields = ('first_name', 'last_name', 'username', "new_email",'email', 'phone', 'landline', 'address', 'photo')
    
    def update(self, instance, validated_data):
        user_email = validated_data.pop('new_email', None)

        if user_email is not None:
            user = instance.user
            user.email = user_email
            user.save()

        return super().update(instance, validated_data)

# ========= Product Serializer ========= #
class ProductSerializer(serializers.ModelSerializer):
    """ نمایش محصول مرتبط با آیتم سفارش """
    class Meta:
        model = Product
        fields = ("id", "name", "part_code", "price", "is_stock", "warranty", "country_of_origin", "description", "category", "brand", "compatible_cars")
        

# ========= Order Item Serializer ========= #
class OrderItemSerializer(serializers.ModelSerializer):
    """ نمایش آیتم سفارش مربوطه """
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ("product", "price_at_time_of_purchase")
        
    def get_product(self, obj):
        return {
            "id": obj.product.id,
        }

# ========= Profile Order Serializer ========= #
class ProfileOrderSerializer(serializers.ModelSerializer):
    """ نمایش سفارشات مربوط به یک کاربر """
    order_items = OrderItemSerializer(read_only=True, many=True)
    
    class Meta:
        model = Order
        fields = ("id", "user", "order_date", "status", "total_amount", "shipping_address", "order_items")
        
# ======== Address Serializer ======== #
class AddressSerializer(serializers.ModelSerializer):
    """سریالایزر برای مدل آدرس"""
    class Meta:
        model = Address
        fields = ['id', 'province', 'city', 'street', 'postal_code', 'detail']
