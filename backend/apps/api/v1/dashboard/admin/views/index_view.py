from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from ..serializers import DashboardSerializer
from ..permissions import IsAdminOrSuperUser

# ========= Dashboard View ========= #
@extend_schema(tags=['Dashboard'])
class DashboardView(APIView):
    """
    ویو برای نمایش اطلاعات اصلی داشبورد به ادمین.
    تمام آمارها و آیتم‌های اخیر را در یک درخواست برمی‌گرداند.
    """
    permission_classes = [IsAdminOrSuperUser, IsAuthenticated]
    
    def get(self, request):
        """ 
        اطلاعاتی که در سریالایزر ست شده است را نمایش می دهد
        """
        serializer = DashboardSerializer({})
        return Response(serializer.data)
