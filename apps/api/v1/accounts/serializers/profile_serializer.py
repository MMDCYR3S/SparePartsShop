from rest_framework import serializers

from apps.accounts.models import Profile, User
from apps.shop.models import Product
from apps.orders.models import Order, OrderItem

# ========= Profile Serializer ========= #
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    
    class Meta:
        model = Profile
        fields = ('first_name', 'last_name', 'username', 'email', 'phone', 'landline', 'address', 'photo')

# ========= Product Serializer ========= #
class ProductSerializer(serializers.ModelSerializer):
    """ نمایش محصول مرتبط با آیتم سفارش """
    class Meta:
        model = Product
        fields = ("id", "name", "part_code", "price", "stock_quantity", "warranty", "country_of_origin", "description", "category", "brand", "compatible_cars")
        

# ========= Order Item Serializer ========= #
class OrderItemSerializer(serializers.ModelSerializer):
    """ نمایش آیتم سفارش مربوطه """
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ("product", "price_at_time_of_purchase", "quantity")
        
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