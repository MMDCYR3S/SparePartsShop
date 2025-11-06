from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenBlacklistView,
    TokenRefreshView
)

from .views import RegisterView
from .serializers import CustomTokenObtainPairSerializer

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='login'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]