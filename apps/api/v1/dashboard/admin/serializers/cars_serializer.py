from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.shop.models import Car

User = get_user_model()

# ======= Car Management Serializer ======= #
class CarManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت کامل خودروها توسط ادمین.
    """
    # نمایش نام کاربر به جای ID
    username = serializers.CharField(source='user.username', read_only=True)
    
    # فیلد کاربر برای انتخاب توسط ادمین
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False, 
        allow_null=True,
        help_text="می‌توانید این خودرو را به یک کاربر خاص اختصاص دهید."
    )

    class Meta:
        model = Car
        fields = [
            'id', 'user', 'username', 'make', 'model', 'year', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """
        اعتبارسنجی برای جلوگیری از ایجاد خودرو تکراری (برند، مدل، سال).
        """
        make = data.get('make')
        model = data.get('model')
        year = data.get('year')

        # اگر در حالت ویرایش هستیم، خودرو فعلی را از بررسی مستثنی می‌کنیم
        if self.instance:
            if Car.objects.filter(make=make, model=model, year=year).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("خودرویی با این مشخصات از قبل وجود دارد.")
        else: # در حالت ایجاد
            if Car.objects.filter(make=make, model=model, year=year).exists():
                raise serializers.ValidationError("خودرویی با این مشخصات از قبل وجود دارد.")
        
        return data
