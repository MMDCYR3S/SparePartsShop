from django.urls import path
from .views import ContactCreateView, BannerListView

app_name = 'home'

urlpatterns = [
    path('contact/', ContactCreateView.as_view(), name='contact-us'),
    path('banners/', BannerListView.as_view(), name='banners'),
]