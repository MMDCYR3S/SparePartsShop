from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

User = get_user_model()

# ========= Password Reset Request Serializer ========= #
class PasswordResetRequestSerializer(serializers.Serializer):
    """ سریالزری برای درخواست بازنشانی رمز عبور """
    email = serializers.EmailField()

# ========= Password Reset Confirm Serializer ========= #
class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    سریالایزر برای تایید بازنشانی رمز عبور
    ابتدا بررسی میکند که آیا uid و همچنین توکن مورد نظر معتبر است یا خیر
    سپس به تغییر رمز عبور مشغول می شود و پیام موفقیت بازگشتی به کاربر ارسال می کند
    """
    
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"message": "رمز عبور با تکرار آن مطابقت ندارد"})
        
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"message": "لینک بازیابی نامعتبر است"})
        
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"message": "لینک بازیابی نامعتبر است"})
        
        attrs['user'] = user
        return attrs
