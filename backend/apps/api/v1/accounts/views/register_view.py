from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema

from ..serializers import RegisterSerializer

# ======== Register View ======== #
@extend_schema(tags=["auth"])
class RegisterView(GenericAPIView):
    """ ثبت نام کاربر با فیلد هایی که باید برای ایجاد کاربر ارسال شود """
    
    serializer_class = RegisterSerializer
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "کاربر با موفقیت ایجاد شد."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)