from rest_framework import serializers
from apps.home.models import Contact

# ======== Contact Serializer ======== #
class ContactSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای ایجاد فرم ارتباط با ما.
    فیلد کاربر به صورت خودکار از کاربر لاگین کرده پر می‌شود.
    """

    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
