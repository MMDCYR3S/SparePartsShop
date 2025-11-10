from rest_framework import serializers
from apps.shop.models import Category

# ======= Category Management Serializers ======= # 
class CategoryManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای مدیریت کامل دسته‌بندی‌ها توسط ادمین.
    """
    # نمایش نام والد به جای ID
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    # فیلد والد برای انتخاب توسط ادمین
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        required=False, 
        allow_null=True,
        help_text="می‌توانید یک دسته‌بندی والد انتخاب کنید."
    )

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'parent_name', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def validate(self, data):
        """
        اعتبارسنجی برای جلوگیری از ایجاد دسته‌بندی با نام تکراری در یک سطح.
        """
        name = data.get('name')
        parent = data.get('parent')

        # اگر در حالت ویرایش هستیم، دسته‌بندی فعلی را از بررسی مستثنی می‌کنیم
        if self.instance:
            if Category.objects.filter(name=name, parent=parent).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("دسته‌بندی‌ای با این نام در این سطح از قبل وجود دارد.")
        else:
            if Category.objects.filter(name=name, parent=parent).exists():
                raise serializers.ValidationError("دسته‌بندی‌ای با این نام در این سطح از قبل وجود دارد.")
        
        return data