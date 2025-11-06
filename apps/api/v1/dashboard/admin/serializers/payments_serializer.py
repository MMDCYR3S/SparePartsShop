from rest_framework import serializers
from apps.payments.models import Payment

# ========= Order Summary Serializer ========= #
class OrderSummarySerializer(serializers.Serializer):
    """سریالایزر ساده برای نمایش خلاصه سفارش در کنار پرداخت"""
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    status = serializers.CharField(read_only=True)

# ========== Payment Management Serializer ========== #
class PaymentManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت کامل پرداخت‌ها توسط ادمین.
    """
    # نمایش اطلاعات مرتبط به صورت خوانا
    order_summary = OrderSummarySerializer(source='order', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_summary', 'payment_type', 'payment_type_display',
            'status', 'status_display', 'transaction_id'
        ]
        read_only_fields = ['order']

    def validate_transaction_id(self, value):
        """
        اطمینان از اینکه شناسه تراکنش در صورت وجود، منحصر به فرد باشد.
        """
        if Payment.objects.filter(transaction_id=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("این شناسه تراکنش از قبل استفاده شده است.")
        return value
