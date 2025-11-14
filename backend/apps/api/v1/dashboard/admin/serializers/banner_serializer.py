from rest_framework import serializers
from apps.home.models import Banner

# ========= Banner Management Serializer ========= #
class BannerManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت بنرها توسط ادمین.
    """
    # نمایش نام کاربر به جای ID
    username = serializers.CharField(source='user.username', read_only=True)
    # نمایش URL کامل تصویر
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = [
            'id', 'user', 'username', 'image', 'image_url', 'order', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        """
        URL کامل تصویر را برمی‌گرداند.
        """
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None