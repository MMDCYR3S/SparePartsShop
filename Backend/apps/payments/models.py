from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.orders.models import Order

# ======== Payment Type Model ======== #
class PaymentType(models.TextChoices):
    CASH = 'cash', _('نقدی')
    CHECK = 'check', _('چکی')

# ======== Payment Status Model ======== #
class PaymentStatus(models.TextChoices):
    PENDING = 'pending', _('در انتظار تأیید')
    COMPLETED = 'completed', _('تکمیل شده')
    FAILED = 'failed', _('ناموفق')

# ======== Payment Model ======== #
class Payment(models.Model):
    """
    مدل پرداخت مرتبط با هر سفارش
    """
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment', verbose_name="سفارش")
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices, verbose_name="نوع پرداخت")
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, verbose_name="وضعیت پرداخت")
    transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="شناسه تراکنش")

    def __str__(self):
        return f"پرداخت سفارش {self.order.id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "پرداخت"
        verbose_name_plural = "پرداخت‌ها"
