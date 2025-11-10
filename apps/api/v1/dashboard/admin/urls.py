from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserManagementViewSet,
    ProductManagementViewSet,
    CarManagementViewSet,
    CategoryManagementViewSet,
    OrderManagementViewSet,
    PaymentManagementViewSet,
    ContactManagementViewSet,
    BannerManagementViewSet,
    DashboardView,
)

router = DefaultRouter()
router.register(f"users", UserManagementViewSet, basename="users")
router.register(r'products', ProductManagementViewSet, basename='product-management')
router.register(r'cars', CarManagementViewSet, basename='car-management')
router.register(r'categories', CategoryManagementViewSet, basename='category-management')
router.register(r'orders', OrderManagementViewSet, basename='order-management')
router.register(r'payments', PaymentManagementViewSet, basename='payment-management')
router.register(r'contacts', ContactManagementViewSet, basename='contact-management')
router.register(r'banners', BannerManagementViewSet, basename='banner-management')


app_name = 'dashboard'

urlpatterns = [
    path('', include(router.urls)),
    path('index/', DashboardView.as_view(), name='dashboard'),
]