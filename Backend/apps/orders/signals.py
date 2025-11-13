from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderStatus
from apps.payments.models import Payment, PaymentStatus, PaymentType

# ========= Update Payment On Order Save Signal ========= #
@receiver(post_save, sender=Order)
def update_payment_on_order_save(sender, instance, created, **kwargs):
    """
    این سیگنال پس از ذخیره شدن یک سفارش اجرا می‌شود.
    - اگر سفارش جدید باشد، یک رکورد پرداخت برای آن ایجاد می‌کند.
    - وضعیت پرداخت را بر اساس وضعیت سفارش به‌روزرسانی می‌کند.
    """
    payment, created_payment = Payment.objects.get_or_create(
        order=instance,
        payment_type=instance.payment_type,
        amount=instance.total_amount
    )
    
    if instance.status == OrderStatus.CANCELLED:
        payment.status = PaymentStatus.FAILED
    elif instance.status == OrderStatus.PENDING:
        payment.status = PaymentStatus.PENDING
    else:
        payment.status = PaymentStatus.COMPLETED
        
    payment.save()