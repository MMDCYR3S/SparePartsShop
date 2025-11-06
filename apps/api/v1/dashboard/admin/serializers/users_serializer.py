from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.accounts.models import Profile, Address

User = get_user_model()

# ======= Address Serializer ======= # 
class AddressSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش آدرس‌ها در کنار کاربر"""
    class Meta:
        model = Address
        fields = ['id', 'province', 'city', 'street', 'postal_code', 'detail']

# ======= User Management Serializer ======= #
class UserManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت کامل کاربران (ایجاد، ویرایش، نمایش)
    داده‌های مربوط به User و Profile را به صورت یکپارچه مدیریت می‌کند.
    """
    # فیلدهای مربوط به پروفایل
    first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    landline = serializers.CharField(max_length=20, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    addresses = AddressSerializer(many=True, read_only=True)

    # فیلد رمز عبور باید فقط برای نوشتن باشد و در پاسخ نمایش داده نشود
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'is_staff', 'is_active',
            'is_superuser', 'first_name', 'last_name', 'phone', 'landline',
            'photo', 'addresses'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        یک کاربر جدید به همراه پروفایلش ایجاد می‌کند.
        """
        # جدا کردن داده‌های پروفایل از داده‌های کاربر
        profile_data = {
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'phone': validated_data.pop('phone', ''),
            'landline': validated_data.pop('landline', ''),
            'photo': validated_data.pop('photo', None),
        }
        password = validated_data.pop('password')

        # ایجاد کاربر با استفاده از متد create_user برای هش کردن رمز عبور
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # ایجاد پروفایل کاربر
        Profile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        """
        اطلاعات کاربر و پروفایلش را ویرایش می‌کند.
        """
        # جدا کردن داده‌های پروفایل
        profile_data = {
            'first_name': validated_data.pop('first_name', instance.profile.first_name),
            'last_name': validated_data.pop('last_name', instance.profile.last_name),
            'phone': validated_data.pop('phone', instance.profile.phone),
            'landline': validated_data.pop('landline', instance.profile.landline),
            'photo': validated_data.pop('photo', instance.profile.photo),
        }

        # به‌روزرسانی اطلاعات کاربر
        for key, value in validated_data.items():
            setattr(instance, key, value)
        
        # اگر رمز عبور جدیدی ارسال شده بود، آن را هش و به‌روز کن
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()

        # به‌روزرسانی اطلاعات پروفایل
        for key, value in profile_data.items():
            setattr(instance.profile, key, value)
        instance.profile.save()

        return instance