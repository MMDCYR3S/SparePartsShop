from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenBlacklistView,
    TokenRefreshView
)

from .views import (
    RegisterView,
    ProfileView,
    ProfileOrderView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)
from .serializers import CustomTokenObtainPairSerializer

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='login'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/order/", ProfileOrderView.as_view(), name="profile_order"),
    
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]