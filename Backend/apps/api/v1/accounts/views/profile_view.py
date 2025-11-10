from rest_framework.generics import RetrieveUpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Profile
from apps.orders.models import Order
from ..serializers import ProfileSerializer, ProfileOrderSerializer

# ========= Porilfe View ========= #
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
