from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema

from apps.shop.models import Car
from ..serializers import CarManagementSerializer
from ..permissions import IsAdminOrSuperUser

User = get_user_model()

# ========= Car Management ViewSet ========= #
@extend_schema(tags=['Car-Management'])
class CarManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل خودروها توسط ادمین.
    شامل عملیات CRUD و حذف دسته‌جمعی.
    """
    queryset = Car.objects.all().select_related('user')
    serializer_class = CarManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['make', 'model', 'user__username']
    ordering_fields = ['make', 'model', 'year', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """
        اگر کاربری در درخواست مشخص نشده بود، خودرو را به ادمین ایجاد‌کننده اختصاص می‌دهد.
        """
        user = serializer.validated_data.get('user')
        if not user:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی خودروها.
        بدنه درخواست: {"ids": [1, 2, 5]}
        """
        ids_to_delete = request.data.get('ids')
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"error": "Request body must contain a list of 'ids'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = self.get_queryset().filter(id__in=ids_to_delete).delete()
        
        return Response(
            {"message": f"Successfully deleted {count} cars."},
            status=status.HTTP_204_NO_CONTENT
        )
        