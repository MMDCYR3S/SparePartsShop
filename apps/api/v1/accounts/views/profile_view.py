from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Profile
from ..serializers import ProfileSerializer

# ========= Porilfe View ========= #
class ProfileView(RetrieveUpdateAPIView):
    """ نمایش و ویرایش پروفایل کاربر """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # همیشه پروفایل کاربر لاگین کرده را برمی‌گرداند
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile