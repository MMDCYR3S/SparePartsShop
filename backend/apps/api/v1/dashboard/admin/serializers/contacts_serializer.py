from rest_framework import serializers
from apps.home.models import Contact

# ======== Contact Management Serializer ======== #
class ContactManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت پیام‌های تماس با ما توسط ادمین.
    """
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
