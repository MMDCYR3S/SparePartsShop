from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from apps.shop.models import Product

User = get_user_model()

# ======== Order Status ======== #
class OrderStatus(models.TextChoices):
    PENDING = 'pending', _('در حال بررسی')
    CONFIRMED = 'confirmed', _('تأیید شده')
    PROCESSING = 'processing', _('در حال آماده‌سازی')
    SHIPPED = 'shipped', _('ارسال شده')
    DELIVERED = 'delivered', _('تحویل داده شده')
    CANCELLED = 'cancelled', _('لغو شده')

# ======== Order Model ======== #
class Order(models.Model):
    """
    مدل سفارش نهایی شده توسط مشتری
    """
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="کاربر")
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, verbose_name="وضعیت سفارش")
    order_date = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ سفارش")
    shipping_address = models.TextField(verbose_name="آدرس ارسال")
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="مبلغ کل")

    def __str__(self):
        return f"سفارش شماره {self.id} - {self.user.username}"

    class Meta:
        verbose_name = "سفارش"
        verbose_name_plural = "سفارشات"

# ========= Order Item Model ========= #
class OrderItem(models.Model):
    """
    مدل آیتم‌های یک سفارش
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="سفارش")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, verbose_name="محصول")
    quantity = models.PositiveIntegerField(verbose_name="تعداد")
    price_at_time_of_purchase = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="قیمت هنگام خرید")

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"

    class Meta:
        verbose_name = "آیتم سفارش"
        verbose_name_plural = "آیتم‌های سفارش"

