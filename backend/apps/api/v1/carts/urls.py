from django.urls import path
from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveFromCartView
)

app_name = 'carts'

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', AddToCartView.as_view(), name='add-to-cart'),
    path('remove/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
]