from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema

from apps.home.models import Banner
from ..serializers import BannerManagementSerializer
from ..permissions import IsAdminOrSuperUser


# ======= Banner Management ViewSet ======= #
@extend_schema(tags=['Banner-Management'])
class BannerManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل بنرها توسط ادمین.
    شامل عملیات CRUD بدون نیاز به اکشن‌های گروهی.
    """
    queryset = Banner.objects.all().select_related('user')
    serializer_class = BannerManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'created_at']
    ordering = ['-order']

    def perform_create(self, serializer):
        """
        بنر ایجاد شده را به کاربر ادمین (لاگین کرده) اختصاص می‌دهد.
        """
        serializer.save(user=self.request.user)