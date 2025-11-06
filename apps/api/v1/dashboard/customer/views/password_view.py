from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.core.cache import cache

from ..serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

User = get_user_model()

# ======= Password Reset Request View ======= #
class PasswordResetRequestView(GenericAPIView):
    """ ارسال لینک بازیابی رمز عبور به ایمیل """
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.filter(email=email).first()
        
        if user:
            # تولید توکن  و شناسه برای بازیابی
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            site_domain = request.get_host()
            protocol = 'https' if request.is_secure() else 'http'
            
            # ایجاد لینک بازیابی
            reset_link = f"{protocol}://{site_domain}/api/v1/accounts/password-reset-confirm/{uid}/{token}/"
            
            # ارسال ایمیل
            subject = "بازیابی رمز عبور"
            message = f"""
            سلام {user.username},
            برای بازیابی رمز عبور خود روی لینک زیر کلیک کنید:
            {reset_link}
            """
            send_mail(subject, message, 'DEFAULT_FROM_EMAIL', [email])
            
        cache.set(f"password_cache_{user.pk}", token, timeout=600)

        return Response(
            {"message": "اگر ایمیل وارد شده در سیستم موجود باشد، لینک بازیابی رمز عبور برای شما ارسال می شود."},
            status=status.HTTP_200_OK
        )

# ========== Password Reset Confirm View ========== #
class PasswordResetConfirmView(GenericAPIView):
    """ بازیابی رمز عبور و تایید """
    
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # گرفتن شناسه منحصر به فرد کاربر برای کش
        serialized_uid = serializer.validated_data["uid"]
        uid = force_str(urlsafe_base64_decode(serialized_uid))
        user = User.objects.get(pk=uid)
        
        cache_user = cache.get(f"password_cache_{user.pk}")
        
        if not cache_user:
            return Response(
                {"detail": "لینک منقضی شده است."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']
        
        user.set_password(new_password)
        user.save()
        
        cache.delete(f"password_reset_{user.pk}")
        
        return Response(
            {"message": "رمز عبور شما با موفقیت تغییر کرد."},
            status=status.HTTP_200_OK
        )
