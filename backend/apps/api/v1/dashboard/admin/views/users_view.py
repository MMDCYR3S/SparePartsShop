from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_spectacular.utils import extend_schema

from apps.accounts.models import User, Address
from ..serializers import UserManagementSerializer, UserDetailSerializer
from ..permissions import IsAdminOrSuperUser

# ========= User Management ViewSet ========= #
@extend_schema(tags=['User-Management'])
class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل کاربران توسط ادمین.
    شامل عملیات CRUD و اکشن‌های گروهی است.
    """
    queryset = User.objects.all().select_related('profile')
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['id', 'username', 'email', 'profile__first_name', 'profile__last_name']
    ordering_fields = ['id', 'username', 'created_date']
    ordering = ['-created_date']
    parser_classes = [MultiPartParser, FormParser, JSONParser]


    def get_queryset(self):
        """
        بهینه‌سازی کوئری‌ها بر اساس اکشن.
        """
        queryset = User.objects.all().select_related('profile')
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('order_set', 'address_set')
        return queryset
    
    def get_serializer_class(self):
        """
        تغییر داینامیک سریالایزر.
        - برای نمایش جزئیات (Detail): UserDetailSerializer (شامل سفارشات)
        - برای سایر موارد (List, Create, Update): UserManagementSerializer
        """
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserManagementSerializer

    @extend_schema(
        request=UserManagementSerializer(many=True, partial=True),
        responses={200: UserManagementSerializer(many=True)}
    )    
    @action(detail=False, methods=['patch'], url_path="bulk-update")
    def bulk_update(self, request):
        """
        بروزرسانی چندین کاربر به صورت همزمان.
        بدنه درخواست باید یک لیست از آبجکت‌های کاربر باشد.
        مثال: [{"id": 1, "is_active": false}, {"id": 2, "is_active": true}]
        """
        # بررسی می‌کند که آیا بدنه درخواست یک لیست است یا خیر
        if not isinstance(request.data, list):
            return Response(
                {"error": "بدنه درخواست باید یک لیست باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_instances = []
        errors = []
        
        with transaction.atomic():
            for item in request.data:
                # بررسی می‌کند که هر آیتم در لیست، یک دیکشنری باشد
                if not isinstance(item, dict):
                    errors.append({"message": "هر آیتم در لیست باید یک آبجکت (Dictionary) باشد.", "item": item})
                    continue

                user_id = item.get("id")
                if not user_id:
                    errors.append({"message": "هر کاربر باید شامل شناسه (id) باشد.", "item": item})
                    continue
                
                try:
                    user_instance = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    errors.append({"message": "کاربری با این شناسه یافت نشد.", "item": item})
                    continue
                
                serializer = self.get_serializer(user_instance, data=item, partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    updated_instances.append(serializer.data)
                else:
                    errors.append({"message": "مشکلی در بروزرسانی وجود دارد.", "item": item, "errors": serializer.errors})
        
        if errors:
            return Response(
                {"updated": updated_instances, "errors": errors},
                status=status.HTTP_207_MULTI_STATUS
            )
            
        return Response(updated_instances, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path="bulk-delete")
    def bulk_delete(self, request):
        """
        حذف چندین کاربر به صورت همزمان.
        بدنه درخواست باید یک آبجکت با کلید ids و مقدار لیستی از شناسه‌ها باشد.
        {"ids": [1, 2, 3]}
        """
        ids_to_delete = request.data.get("ids")
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"message": "لیست شناسه‌های کاربر باید به صورت لیست باشد."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = User.objects.filter(id__in=ids_to_delete).delete()
        
        return Response(
            {"message": f"{count} کاربر با موفقیت حذف شد."}, 
            status=status.HTTP_204_NO_CONTENT
        )