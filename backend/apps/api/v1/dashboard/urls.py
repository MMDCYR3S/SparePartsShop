from django.urls import path, include

urlpatterns = [
    path("admin/", include("apps.api.v1.dashboard.admin.urls")),
    path("customer/", include("apps.api.v1.dashboard.customer.urls")),
]
