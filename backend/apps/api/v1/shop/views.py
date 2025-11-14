from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.shop.models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer
from .filters import ProductFilter

# ========= Product ViewSet ========= #
@extend_schema(tags=["Products"])
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ویوست برای نمایش لیست محصولات با فیلترینگ و جستجو
    و نمایش جزئیات هر محصول
    """
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'brand', 'part_code', 'compatible_cars__make', 'compatible_cars__model']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # اطمینان از اینکه تصویر اصلی در کوئری وجود دارد
        queryset = queryset.prefetch_related('images', 'compatible_cars').select_related('category')
        return queryset