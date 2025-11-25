from rest_framework import serializers

from apps.accounts.models import User
from apps.home.models import Contact
from apps.orders.models import Order

# ======== Recent User Serializer ======== #
class RecentUserSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش کاربران اخیر"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_date']

# ======== Recent Order Serializer ======== #
class RecentOrderSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش سفارشات اخیر"""
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'username', 'total_amount', 'status', 'status_display', 'order_date']

# ========= Recent Contact Serializer ========= #
class RecentContactSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش پیام‌های اخیر"""
    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'subject', 'created_at']

# ========= User Stats Serializer ========= #
class UserStatsSerializer(serializers.Serializer):
    """آمار کاربران"""
    total_users = serializers.IntegerField(read_only=True)
    total_admins = serializers.IntegerField(read_only=True)
    total_buyers = serializers.IntegerField(read_only=True)

# ========= Product Stats Serializer ========= #
class ProductStatsSerializer(serializers.Serializer):
    """آمار محصولات و خودروها"""
    total_products = serializers.IntegerField(read_only=True)
    active_products = serializers.IntegerField(read_only=True)
    total_cars = serializers.IntegerField(read_only=True)

# ========= Order Stats Serializer ========= #
class OrderStatsSerializer(serializers.Serializer):
    """آمار سفارشات"""
    total_orders = serializers.IntegerField(read_only=True)
    pending_orders = serializers.IntegerField(read_only=True)
    cancelled_orders = serializers.IntegerField(read_only=True)

# ========= Revenue Stats Serializer ========= #
class RevenueStatsSerializer(serializers.Serializer):
    """آمار درآمدها"""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=0, read_only=True)
    this_month_revenue = serializers.DecimalField(max_digits=15, decimal_places=0, read_only=True)
    today_revenue = serializers.DecimalField(max_digits=15, decimal_places=0, read_only=True)

# ========= Stats Serializers ========= #
class UserStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_buyers = serializers.IntegerField()

class ProductStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    active_products = serializers.IntegerField()
    total_cars = serializers.IntegerField()

class OrderStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()

class RevenueStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=0)
    this_month_revenue = serializers.DecimalField(max_digits=15, decimal_places=0)
    today_revenue = serializers.DecimalField(max_digits=15, decimal_places=0)

# ========= Dashboard Serializer (Main) ========= #
class DashboardSerializer(serializers.Serializer):
    """
    فقط ساختار را تعریف می‌کند. داده‌ها از ویو پاس داده می‌شوند.
    """
    user_stats = UserStatsSerializer()
    product_stats = ProductStatsSerializer()
    order_stats = OrderStatsSerializer()
    revenue_stats = RevenueStatsSerializer()
    
    # برای لیست‌ها، خود سریالایزر QuerySet را تبدیل می‌کند
    recent_contacts = RecentContactSerializer(many=True)
    recent_users = RecentUserSerializer(many=True)
    recent_orders = RecentOrderSerializer(many=True)
