from django.urls import path
from ..views import *

urlpatterns = [
    path("index/", DashboardView.as_view(), name="dashboard_index"),
    path("users/", UsersView.as_view(), name="users"),
    path("users/form/", UsersFormView.as_view(), name="users_form"),
    path("orders/", OrdersView.as_view(), name="orders"),
    path("orders/form/", OrdersFormView.as_view(), name="orders_form"),
    path("products/", ProductView.as_view(), name="products"),
    path("products/form/", ProductFormView.as_view(), name="products_form"),
    path("payments/", PaymentsView.as_view(), name="payments"),
    path("payments/form/", PaymentsFormView.as_view(), name="payments_form"),
    path("cars/", CarView.as_view(), name="cars"),
    path("categories/", CategoryView.as_view(), name="categories"),
    path("banners/", BannerView.as_view(), name="banners"),
]
