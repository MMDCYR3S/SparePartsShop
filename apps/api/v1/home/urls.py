from django.urls import path
from .views import ContactCreateView

app_name = 'home'

urlpatterns = [
    path('contact/', ContactCreateView.as_view(), name='contact-us'),
]