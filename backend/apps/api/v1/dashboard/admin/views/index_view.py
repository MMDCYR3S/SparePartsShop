from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from apps.accounts.models import User
from apps.home.models import Contact
from apps.orders.models import Order, OrderStatus
from apps.shop.models import Product, Car
from apps.payments.models import Payment, PaymentStatus
from ..serializers import DashboardSerializer
from ..permissions import IsAdminOrSuperUser

# ========= Dashboard View ========= #
@extend_schema(tags=['Dashboard'])
class DashboardView(GenericAPIView):
    permission_classes = [IsAdminOrSuperUser, IsAuthenticated]
    serializer_class = DashboardSerializer

    def get(self, request):
        now = timezone.now()

        # 1. محاسبه آمار کاربران
        user_stats_data = {
            "total_users": User.objects.filter(is_active=True).count(),
            "total_admins": User.objects.filter(Q(is_superuser=True) | Q(is_staff=True)).count(),
            "total_buyers": User.objects.filter(order__isnull=False).distinct().count(),
        }

        # 2. محاسبه آمار محصولات
        product_stats_data = {
            "total_products": Product.objects.count(),
            "active_products": Product.objects.filter(is_active=True).count(),
            "total_cars": Car.objects.count(),
        }

        # 3. محاسبه آمار سفارشات
        order_stats_data = {
            "total_orders": Order.objects.count(),
            "pending_orders": Order.objects.filter(status=OrderStatus.PENDING).count(),
            "cancelled_orders": Order.objects.filter(status=OrderStatus.CANCELLED).count(),
        }

        # 4. محاسبه درآمدها
        total_revenue = Payment.objects.filter(status=PaymentStatus.COMPLETED).aggregate(
            total=Sum('order__total_amount')
        )['total'] or 0
        
        this_month_revenue = Payment.objects.filter(
            status=PaymentStatus.COMPLETED,
            order__order_date__year=now.year,
            order__order_date__month=now.month
        ).aggregate(total=Sum('order__total_amount'))['total'] or 0

        today_revenue = Payment.objects.filter(
            status=PaymentStatus.COMPLETED,
            order__order_date__date=now.date()
        ).aggregate(total=Sum('order__total_amount'))['total'] or 0

        revenue_stats_data = {
            "total_revenue": total_revenue,
            "this_month_revenue": this_month_revenue,
            "today_revenue": today_revenue,
        }

        # 5. دریافت لیست‌های اخیر (QuerySet خام پاس میدهیم)
        recent_contacts_qs = Contact.objects.order_by('-created_at')[:3]
        recent_users_qs = User.objects.order_by('-created_date')[:3]
        recent_orders_qs = Order.objects.select_related('user').order_by('-order_date')[:3]

        # === تجمیع همه داده‌ها در یک دیکشنری اصلی ===
        dashboard_data = {
            "user_stats": user_stats_data,
            "product_stats": product_stats_data,
            "order_stats": order_stats_data,
            "revenue_stats": revenue_stats_data,
            "recent_contacts": recent_contacts_qs,
            "recent_users": recent_users_qs,
            "recent_orders": recent_orders_qs,
        }

        # پاس دادن داده به سریالایزر
        serializer = DashboardSerializer(instance=dashboard_data)
        return Response(serializer.data)