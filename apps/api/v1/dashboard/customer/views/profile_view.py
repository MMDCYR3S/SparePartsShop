from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework import status

from apps.accounts.models import Profile, Address
from apps.orders.models import Order
from ..serializers import (
    ProfileSerializer,
    ProfileOrderSerializer,
    AddressSerializer
)

# ========= Profile View ========= #
class ProfileView(RetrieveUpdateAPIView):
    """ نمایش و ویرایش پروفایل کاربر """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile
    
# ======== Profile Order View ======== #
class ProfileOrderView(ListAPIView):
    """ نمایش سفارشات کاربر """
    serializer_class = ProfileOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
# ======== Address Detail View ========
class AddressDetailView(RetrieveUpdateDestroyAPIView):
    """
    ویو برای نمایش، ویرایش و حذف یک آدرس خاص.
    """
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        این متد را بازنویسی می‌کنیم تا اطمینان حاصل کنیم که کاربر
        فقط به آدرس‌های خودش دسترسی دارد.
        """
        pk = self.kwargs.get('pk')
        try:
            address = Address.objects.get(pk=pk)
            if address.user != self.request.user:
                raise PermissionDenied("شما اجازه دسترسی به این آدرس را ندارید.")
            return address
        except Address.DoesNotExist:
            from rest_framework import status
            from rest_framework.response import Response
            return Response({"error": "آدرس یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        
# ======== Address Create View ========
class AddressListCreateView(GenericAPIView):
    """نمایش و ایجاد آدرس‌های کاربر"""
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user) # کاربر را به آدرس متصل می‌کنیم
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
