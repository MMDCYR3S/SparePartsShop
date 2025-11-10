from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from apps.orders.models import Order, OrderItem, OrderStatus
from ..serializers import OrderManagementSerializer
from ..permissions import IsAdminOrSuperUser

# ========== Order Management ViewSet ========== #
class OrderManagementViewSet(viewsets.ModelViewSet):
    """
    ویوست برای مدیریت کامل سفارش‌ها توسط ادمین.
    شامل عملیات CRUD و اکشن‌های گروهی.
    """
    
    queryset = Order.objects.all().prefetch_related('items__product', 'payment').select_related('user')
    serializer_class = OrderManagementSerializer
    permission_classes = [IsAdminOrSuperUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'shipping_address', 'items__product__name']
    ordering_fields = ['order_date', 'total_amount', 'status']
    ordering = ['-order_date']
    
    # ======== اکشن‌های گروهی (Bulk Actions) ========
    @action(detail=False, methods=['patch'], url_path='bulk-update-status')
    def bulk_update_status(self, request):
        """
        به‌روزرسانی وضعیت دسته‌جمعی سفارش‌ها.
        بدنه درخواست: {"ids": [1, 2, 5], "status": "confirmed"}
        """
        ids_to_update = request.data.get('ids')
        new_status = request.data.get('status')

        if not isinstance(ids_to_update, list) or not ids_to_update or new_status not in [choice.value for choice in OrderStatus]:
            return Response(
                {"error": "باید لیستی از شماره‌های سفارش‌ها و یک وضعیت معتبر باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # به‌روزرسانی وضعیت سفارش‌ها. سیگنال به طور خودکار پرداخت‌ها را آپدیت می‌کند.
        count = self.get_queryset().filter(id__in=ids_to_update).update(status=new_status)
        
        return Response(
            {"message": f"تعداد {count} سفارش با موفقیت به‌روزرسانی شدند."},
            status=status.HTTP_200_OK
        )
        
    @action(detail=False, methods=['delete'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        حذف دسته‌جمعی سفارش‌ها.
        بدنه درخواست: {"ids": [1, 2, 5]}
        """
        
        ids_to_delete = request.data.get('ids')
        if not isinstance(ids_to_delete, list) or not ids_to_delete:
            return Response(
                {"error": "Request body must contain a list of 'ids'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            orders_to_delete = self.get_queryset().filter(id__in=ids_to_delete)
            for order in orders_to_delete:
                for item in order.items.all():
                    if order.status == OrderStatus.PENDING or order.status == OrderStatus.CANCELLED:
                        item.product.quantity += item.quantity
                        item.product.save()
                        
            count, _ = orders_to_delete.delete()

        return Response(
            {"message": f"تعداد {count} سفارش با موفقیت حذف شدند."},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['delete'], url_path='bulk-delete-items')
    def bulk_delete_items(self, request):
        """
        حذف دسته‌جمعی آیتم‌ها از یک سفارش خاص.
        بدنه درخواست: {"order_id": 1, "item_ids": [2, 3]}
        """
        
        order_id = request.data.get('order_id')
        item_ids = request.data.get('item_ids')

        if not order_id or not isinstance(item_ids, list) or not item_ids:
            return Response(
                {"error": "لیست آیتم‌ها باید شامل شماره‌های آیتم‌ها و شماره سفارش باشد."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = get_object_or_404(Order, id=order_id)
        
        with transaction.atomic():
            items_to_delete = order.items.filter(id__in=item_ids)
            if not items_to_delete.exists():
                return Response({"error": "هیچ آیتم معتبری برای حذف یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

            # موجودی را برگردان و آیتم‌ها را حذف کن
            for item in items_to_delete:
                if order.status == OrderStatus.PENDING or order.status == OrderStatus.CANCELLED:
                    item.product.stock_quantity += item.quantity
                    item.product.save()
            
            deleted_count, _ = items_to_delete.delete()

            # محاسبه مجدد مبلغ کل سفارش
            new_total = sum(
                item.price_at_time_of_purchase * item.quantity 
                for item in order.items.all()
            )
            order.total_amount = new_total
            order.save()

        return Response(
            {"message": f"تعداد {deleted_count} آیتم با موفقیت حذف شدند و قیمت سفارش جدید برابر با {new_total} است."},
            status=status.HTTP_204_NO_CONTENT
        )
    