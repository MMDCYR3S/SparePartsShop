from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# =========== Custom Token Obtain Pair Serializer =========== #
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    ورود با استفاده از نام کاربری و رمز عبور
    اگر نام کاربری موجود نبود، با ایمیل جست و جو مجدد انجام می شود
    """
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        self.username_field = 'username'
        try:
            user = User.objects.get(username=attrs['username'])
        except User.DoesNotExist:
            self.username_field = 'email'
            try:
                user = User.objects.get(email=attrs['username'])
                attrs['username'] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError({"message" :"کاربری با این مشخصات یافت نشد."}, code='authorization')

        return super().validate(attrs)