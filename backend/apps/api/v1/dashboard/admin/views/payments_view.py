from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from apps.payments.models import Payment, PaymentStatus
from ..serializers import PaymentManagementSerializer
from ..permissions import IsAdminOrSuperUser

# ====== Payment Management ViewSet ======= #
@extend_schema(tags=['Payment-Management'])
class PaymentManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل پرداخت‌ها توسط ادمین.
    شامل عملیات CRUD و اکشن‌های گروهی.
    """
    queryset = Payment.objects.all().select_related('order__user')
    serializer_class = PaymentManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id', 'order__user__username', 'transaction_id']
    ordering_fields = ['order__order_date', 'status']
    ordering = ['-order__order_date']
    
    # ======== اکشن‌های گروهی (Bulk Actions) ========
    @action(detail=False, methods=['patch'], url_path='bulk-update-status')
    def bulk_update_status(self, request):
        """
        به‌روزرسانی وضعیت دسته‌جمعی پرداخت‌ها.
        **توجه:** این عملیات مستقیماً وضعیت پرداخت را تغییر می‌دهد و بر منطق سیگنال سفارش غلوب می‌کند.
        بدنه درخواست: {"ids": [1, 2, 5], "status": "completed"}
        """
        ids_to_update = request.data.get('ids')
        new_status = request.data.get('status')

        if not isinstance(ids_to_update, list) or not ids_to_update or new_status not in [choice.value for choice in PaymentStatus]:
            return Response(
                {"error": "لیست باید دارای وضعیت معتبر باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = self.get_queryset().filter(id__in=ids_to_update).update(status=new_status)
        
        return Response(
            {"message": f"تعداد {count} پرداخت با موفقیت به‌روزرسانی شدند."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی پرداخت‌ها.
        **هشدار:** حذف یک پرداخت، سفارش مرتبط با آن را حذف نمی‌کند.
        بدنه درخواست: {"ids": [1, 2, 5]}
        """
        ids_to_delete = request.data.get('ids')
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"error": "باید لیستی از شناسه های پرداخت‌ها باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = self.get_queryset().filter(id__in=ids_to_delete).delete()
        
        return Response(
            {"message": f"تعداد {count} پرداخت با موفقیت حذف شدند."},
            status=status.HTTP_204_NO_CONTENT
        )
