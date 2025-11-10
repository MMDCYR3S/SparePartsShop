from rest_framework import serializers
from apps.shop.models import Product, ProductImage, Category, Car

# ======= Product Image Serializer ======= #
class ProductImageSerializer(serializers.ModelSerializer):
    """سریالایزر برای تصاویر محصول"""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'is_main']
        read_only_fields = ['product']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

# ======= Category Serializer ======= #
class CategorySerializer(serializers.ModelSerializer):
    """سریالایزر برای دسته‌بندی‌ها"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']

# ======= Car Serializer ======= #
class CarSerializer(serializers.ModelSerializer):
    """سریالایزر برای خودروها"""
    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year']

# ======= Product Management Serializer ======= #
class ProductManagementSerializer(serializers.ModelSerializer):
    """
    سریالایزر اصلی برای مدیریت کامل محصولات.
    """
    # نمایش اطلاعات مرتبط به صورت خوانا
    slug = serializers.SlugField(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    compatible_cars_info = CarSerializer(source='compatible_cars', many=True, read_only=True)

    # فیلدها برای ورود اطلاعات هنگام ایجاد/ویرایش
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    compatible_cars = serializers.PrimaryKeyRelatedField(many=True, queryset=Car.objects.all(), required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'part_code', 'brand', 'country_of_origin',
            'warranty', 'price', 'stock_quantity', 'package_quantity', 'allow_individual_sale',
            'is_active', 'category', 'category_name', 'compatible_cars', 'compatible_cars_info',
            'images'
        ]
        # part_code باید منحصر به فرد باشد
        extra_kwargs = {
            'part_code': {'validators': []}
        }

    def validate_part_code(self, value):
        """
        اطمینان از اینکه کد قطعه در حالت ایجاد تکراری نباشد.
        """
        user = self.context['request'].user
        # اگر در حالت آپدیت هستیم، محصول فعلی را از بررسی مستثنی می‌کنیم
        if self.instance:
            if Product.objects.filter(part_code=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("کد قطعه با این مقدار از قبل وجود دارد.")
        else: # در حالت ایجاد
            if Product.objects.filter(part_code=value).exists():
                raise serializers.ValidationError("کد قطعه با این مقدار از قبل وجود دارد.")
        return value