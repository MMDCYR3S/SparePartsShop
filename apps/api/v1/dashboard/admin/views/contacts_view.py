from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.home.models import Contact
from ..serializers import ContactManagementSerializer
from ..permissions import IsAdminOrSuperUser

class ContactManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل پیام‌های تماس با ما توسط ادمین.
    شامل عملیات CRUD و اکشن‌های گروهی.
    """
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = ContactManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email', 'subject']
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']

    # ======== اکشن‌های گروهی (Bulk Actions) ========
    @action(detail=False, methods=['patch'], url_path='bulk-update-read-status')
    def bulk_update_read_status(self, request):
        """
        تغییر وضعیت "خوانده شده" برای چندین پیام به صورت همزمان.
        بدنه درخواست: {"ids": [1, 2, 5], "is_read": true}
        """
        ids_to_update = request.data.get('ids')
        new_status = request.data.get('is_read')

        if not isinstance(ids_to_update, list) or not ids_to_update or new_status is None:
            return Response(
                {"error": "باید لیستی از شناسه های پیام ها و وضعیت های آن باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = self.get_queryset().filter(id__in=ids_to_update).update(is_read=new_status)
        
        return Response(
            {"message": f"تعداد {count} پیام با موفقیت به‌روزرسانی شدند."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی پیام‌ها.
        بدنه درخواست: {"ids": [1, 2, 5]}
        """
        ids_to_delete = request.data.get('ids')
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"error": "باید لیستی از شناسه های پیام ها باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = self.get_queryset().filter(id__in=ids_to_delete).delete()
        
        return Response(
            {"message": f"تعداد {count} پیام با موفقیت حذف شدند."},
            status=status.HTTP_204_NO_CONTENT
        )