from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction

from apps.accounts.models import User
from ..serializers import UserManagementSerializer
from ..permissions import IsAdminOrSuperUser

# ========= User Management ViewSet ========= #
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
    ordering_fields = ['id', 'username', 'date_joined']
    ordering = ['-date_joined']
    parser_classes = [MultiPartParser, FormParser]
    
    @action(detail=False, methods=['POST'], url_path="bulk-create")
    def bulk_create(self, request):
        """
        ایجاد چندین کاربر به صورت همزمان.
        بدنه درخواست باید یک لیست از آبجکت‌های کاربر باشد.
        """
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['PATCH'], url_path="bulk-update")
    def bulk_update(self, request):
        """
        بروزرسانی چندین کاربر به صورت همزمان.
        بدنه درخواست باید یک لیست از آبجکت‌های کاربر باشد.
        """
        updated_instances = []
        errors = []
        
        with transaction.atomic():
            for item in request.data:
                user_id = item.get("id")
                if not user_id:
                    errors.append({"message": "هر کاربر باید شامل شناسه باشد.", "item": {item}})
                
                user_instance = get_object_or_404(User, id=user_id)
                serializer = self.get_serializer(user_instance, data=item, partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    updated_instances.append(serializer.data)
                else:
                    errors.append({"message": "مشکلی در بروزرسانی وجود دارد.", "item": item, "errors": serializer.errors})
            
        if errors:
            return Response(
                {"updated": updated_instances,
                "errors": errors}, status=status.HTTP_207_MULTI_STATUS
            )
            
        return Response(updated_instances, status=status.HTTP_200_OK)

    @action(detail=False, methods=['DELETE'], url_path="bulk-delete")
    def bulk_delete(self, request):
        """
        حذف چندین کاربر به صورت همزمان.
        بدنه درخواست باید یک لیست از شناسه‌های کاربر باشد.
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
    
    @action(detail=True, methods=['post'], url_path='addresses')
    def create_address(self, request, pk=None):
        """
        ایجاد یک آدرس جدید برای کاربر مشخص شده با pk.
        URL: POST /api/v1/admin/users/<pk>/addresses/
        """
        user = self.get_object()
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='addresses/(?P<address_pk>[^/.]+)')
    def update_address(self, request, pk=None, address_pk=None):
        """
        ویرایش یک آدرس مشخص که متعلق به کاربر است.
        URL: PATCH /api/v1/admin/users/<pk>/addresses/<address_pk>/
        """
        user = self.get_object()
        try:
            address = Address.objects.get(pk=address_pk, user=user)
        except Address.DoesNotExist:
            return Response(
                {"error": "آدرس مورد نظر یافت نشد یا متعلق به این کاربر نیست."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
