from django.urls import path, include

app_name = "v1"

urlpatterns = [
    path("accounts/", include("apps.api.v1.accounts.urls")),
    path("home/", include("apps.api.v1.home.urls")),
    path("dashboard/", include("apps.api.v1.dashboard.urls")),
    path("shop/", include("apps.api.v1.shop.urls")),
    path("carts/", include("apps.api.v1.carts.urls")),
    path("orders/", include("apps.api.v1.orders.urls")),
]
