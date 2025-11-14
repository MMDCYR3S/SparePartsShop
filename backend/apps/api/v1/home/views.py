from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from apps.home.models import Contact, Banner
from drf_spectacular.utils import extend_schema

from .serializers import ContactSerializer, BannerSerializer

# ====== Contact Create View ======= #
@extend_schema(tags=["ContactUs"])
class ContactCreateView(generics.CreateAPIView):
    """
    ویو برای ایجاد یک پیام جدید در فرم ارتباط با ما.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        متد create را بازنویسی می‌کنیم تا یک پیام سفارشی در پاسخ موفقیت‌آمیز برگردانیم.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        
        return Response(
            {"message": "پیام شما با موفقیت ارسال شد. در اسرع وقت بررسی خواهد شد."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
        
# ====== Banner List View ======= #
@extend_schema(tags=["Banner"])
class BannerListView(generics.ListAPIView):
    """
    ویو برای نمایش لیست بنرها.
    """
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]
