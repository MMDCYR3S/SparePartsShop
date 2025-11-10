from django.urls import path, include

urlpatterns = [
    path("admin/", include("apps.dashboard.urls.admin_urls")),
]
