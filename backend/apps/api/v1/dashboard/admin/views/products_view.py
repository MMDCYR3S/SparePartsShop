# در فایل views.py اپلیکیشن products

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_spectacular.utils import extend_schema

from apps.shop.models import Product, ProductImage
from ..serializers import ProductManagementSerializer, ProductImageSerializer
from ..permissions import IsAdminOrSuperUser

# ========= Product Management ViewSet ========= #
@extend_schema(tags=['Product-Management'])
class ProductManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل محصولات توسط ادمین.
    شامل عملیات CRUD و اکشن‌های گروهی (فعال/غیرفعال و حذف).
    """
    queryset = Product.objects.all().prefetch_related('images', 'compatible_cars').select_related('category')
    serializer_class = ProductManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'brand', 'part_code', 'category__name']
    ordering_fields = ['name', 'price', 'stock_quantity', 'date_created']
    ordering = ['-id']
    parser_classes = [MultiPartParser, FormParser]

    # ======== اکشن‌های گروهی (Bulk Actions) ========

    @action(detail=False, methods=['patch'], url_path='bulk-update-status')
    def bulk_update_status(self, request):
        """
        فعال یا غیرفعال کردن دسته‌جمعی محصولات.
        بدنه درخواست: {"ids": [1, 2, 5], "is_active": true}
        """
        ids_to_update = request.data.get('ids')
        new_status = request.data.get('is_active')

        if not isinstance(ids_to_update, list) or not ids_to_update or new_status is None:
            return Response(
                {"error": "درخواست شما باید شامل یک لیستی از شناسه های محصول باشد"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = self.get_queryset().filter(id__in=ids_to_update).update(is_active=new_status)
        
        return Response(
            {"message": f"وضعیت {count} محصول با موفقیت بروزرسانی شد."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی محصولات.
        بدنه درخواست: {"ids": [1, 2, 5]}
        """
        ids_to_delete = request.data.get('ids')
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"error": "درخواست شما باید شامل یک لیستی از شناسه های محصول باشد"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count, _ = self.get_queryset().filter(id__in=ids_to_delete).delete()
        
        return Response(
            {"message": f"تعداد {count} محصول با موفقیت حذف شد."},
            status=status.HTTP_204_NO_CONTENT
        )

    # ======== اکشن‌های سفارشی برای مدیریت تصاویر ========

    @action(detail=True, methods=['post'], url_path='images')
    def add_image(self, request, pk=None):
        """
        اضافه کردن یک تصویر جدید به یک محصول خاص.
        بدنه درخواست باید شامل فایل تصویر و یک فیلد is_main (اختیاری) باشد.
        """
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # اگر تصویر جدید به عنوان اصلی انتخاب شد، بقیه را غیرفعال کن
            if serializer.validated_data.get('is_main', False):
                ProductImage.objects.filter(product=product).update(is_main=False)
            
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @add_image.mapping.delete
    def delete_image(self, request, pk=None):
        """
        حذف یک تصویر خاص از یک محصول.
        بدنه درخواست باید شامل image_id باشد.
        """
        product = self.get_object()
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({"error": "شناسه عکس مورد نیاز است."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            image = ProductImage.objects.get(id=image_id, product=product)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({"error": "عکس یافت نشد!"}, status=status.HTTP_404_NOT_FOUND)