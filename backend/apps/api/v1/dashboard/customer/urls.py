from django.urls import path, include
from .views import (
    ProfileView, 
    ProfileOrderView, 
    AddressListCreateView, 
    AddressDetailView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

app_name = "customer"

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/order/", ProfileOrderView.as_view(), name="profile_order"),
    path("addresses/", AddressListCreateView.as_view(), name="profile_address"),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
