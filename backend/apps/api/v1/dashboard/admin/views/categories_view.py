from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.shop.models import Category
from ..serializers import CategoryManagementSerializer
from ..permissions import IsAdminOrSuperUser

class CategoryManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل دسته‌بندی‌ها توسط ادمین.
    شامل عملیات CRUD و حذف دسته‌جمعی.
    """
    queryset = Category.objects.all().select_related('parent')
    serializer_class = CategoryManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی دسته‌بندی‌ها.
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
            {"message": f"Successfully deleted {count} categories."},
            status=status.HTTP_204_NO_CONTENT
        )