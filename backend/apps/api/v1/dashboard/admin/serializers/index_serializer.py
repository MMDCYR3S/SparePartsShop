from rest_framework import serializers

from apps.accounts.models import User
from apps.home.models import Contact
from apps.orders.models import Order

# ======== Recent User Serializer ======== #
class RecentUserSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش کاربران اخیر"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']

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

# ========= Dashboard Serializer ========= #
class DashboardSerializer(serializers.Serializer):
    """
    سریالایزر اصلی برای جمع‌آوری تمام اطلاعات مورد نیاز داشبورد ادمین.
    """
    user_stats = UserStatsSerializer(read_only=True)
    product_stats = ProductStatsSerializer(read_only=True)
    order_stats = OrderStatsSerializer(read_only=True)
    revenue_stats = RevenueStatsSerializer(read_only=True)
    recent_contacts = RecentContactSerializer(many=True, read_only=True)
    recent_users = RecentUserSerializer(many=True, read_only=True)
    recent_orders = RecentOrderSerializer(many=True, read_only=True)

    def get_user_stats(self, obj):
        """محاسبه آمار کاربران"""
        return {
            "total_users": User.objects.filter(is_active=True).count(),
            "total_admins": User.objects.filter(Q(is_superuser=True) | Q(is_staff=True)).count(),
            "total_buyers": User.objects.filter(order_set__isnull=False).distinct().count(),
        }

    def get_product_stats(self, obj):
        """محاسبه آمار محصولات و خودروها"""
        return {
            "total_products": Product.objects.count(),
            "active_products": Product.objects.filter(is_active=True).count(),
            "total_cars": Car.objects.count(),
        }

    def get_order_stats(self, obj):
        """محاسبه آمار سفارشات"""
        return {
            "total_orders": Order.objects.count(),
            "pending_orders": Order.objects.filter(status=OrderStatus.PENDING).count(),
            "cancelled_orders": Order.objects.filter(status=OrderStatus.CANCELLED).count(),
        }

    def get_revenue_stats(self, obj):
        """محاسبه آمار درآمدها"""
        now = timezone.now()
        
        # محاسبه کل درآمد از پرداخت‌های موفق
        total_revenue_agg = Payment.objects.filter(status=PaymentStatus.COMPLETED).aggregate(
            total=Sum('order__total_amount')
        )['total'] or 0

        # محاسبه درآمد این ماه
        this_month_revenue_agg = Payment.objects.filter(
            status=PaymentStatus.COMPLETED,
            order__order_date__year=now.year,
            order__order_date__month=now.month
        ).aggregate(total=Sum('order__total_amount'))['total'] or 0

        # محاسبه درآمد امروز
        today_revenue_agg = Payment.objects.filter(
            status=PaymentStatus.COMPLETED,
            order__order_date__date=now.date()
        ).aggregate(total=Sum('order__total_amount'))['total'] or 0
        
        return {
            "total_revenue": total_revenue_agg,
            "this_month_revenue": this_month_revenue_agg,
            "today_revenue": today_revenue_agg,
        }

    def get_recent_contacts(self, obj):
        """دریافت ۳ پیام اخیر"""
        return RecentContactSerializer(
            Contact.objects.order_by('-created_at')[:3], many=True
        ).data

    def get_recent_users(self, obj):
        """دریافت ۳ کاربر اخیر"""
        return RecentUserSerializer(
            User.objects.order_by('-date_joined')[:3], many=True
        ).data

    def get_recent_orders(self, obj):
        """دریافت ۳ سفارش اخیر"""
        return RecentOrderSerializer(
            Order.objects.select_related('user').order_by('-order_date')[:3], many=True
        ).data
