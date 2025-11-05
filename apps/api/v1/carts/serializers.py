from rest_framework import serializers

from apps.carts.models import Cart, CartItem
from apps.shop.models import Product

# ========= Product Simple Serializer ========= #
class ProductSimpleSerializer(serializers.ModelSerializer):
    """سریالایزر ساده برای نمایش اطلاعات محصول در سبد خرید"""
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'brand', 'part_code', 'price', 'main_image', 'package_quantity', 'allow_individual_sale']
    
    def get_main_image(self, obj):
        """برگرداندن تصویر اصلی محصول"""
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_image.image.url)
            return main_image.image.url
        return None

# ========= Cart Item Serializer ========= #
class CartItemSerializer(serializers.ModelSerializer):
    """سریالایزر برای آیتم‌های سبد خرید"""
    product = ProductSimpleSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.SerializerMethodField()
    is_package = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'is_package']
    
    def get_total_price(self, obj):
        """محاسبه قیمت کل آیتم"""
        return obj.product.price * obj.quantity
    
    def get_is_package(self, obj):
        """بررسی اینکه آیا تعداد انتخابی معادل یک بسته کامل است"""
        return obj.quantity >= obj.product.package_quantity and obj.quantity % obj.product.package_quantity == 0

# ========= Cart Serializer ========= #
class CartSerializer(serializers.ModelSerializer):
    """سریالایزر برای نمایش سبد خرید"""
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items', 'total_price', 'total_items']
        read_only_fields = ['user', 'created_at']
    
    def get_total_price(self, obj):
        """محاسبه قیمت کل سبد خرید"""
        return sum(item.product.price * item.quantity for item in obj.items.all())
    
    def get_total_items(self, obj):
        """محاسبه تعداد کل آیتم‌ها در سبد خرید"""
        return sum(item.quantity for item in obj.items.all())

# ========= Add To Cart Serializer ========= #
class AddToCartSerializer(serializers.Serializer):
    """سریالایزر برای افزودن محصول به سبد خرید"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate_product_id(self, value):
        """بررسی وجود محصول"""
        try:
            Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول مورد نظر یافت نشد یا غیرفعال است.")
        return value
    
    def validate(self, data):
        """بررسی موجودی محصول"""
        product = Product.objects.get(id=data['product_id'])
        if data['quantity'] > product.stock_quantity:
            raise serializers.ValidationError(f"تعداد درخواستی بیشتر از موجودی محصول ({product.stock_quantity}) است.")
        
        # بررسی محدودیت فروش تکی
        if not product.allow_individual_sale and data['quantity'] < product.package_quantity:
            raise serializers.ValidationError(f"این محصول فقط به صورت بسته‌ای ({product.package_quantity}) (عددی) قابل فروش است.")
        
        return data

# ========= Update Cart Item Serializer ========= #
class UpdateCartItemSerializer(serializers.Serializer):
    """سریالایزر برای ویرایش تعداد آیتم در سبد خرید"""
    quantity = serializers.IntegerField(min_value=1)
    
    def validate(self, data):
        """بررسی موجودی محصول و محدودیت‌های فروش"""
        cart_item = self.context['cart_item']
        product = cart_item.product
        
        if data['quantity'] > product.stock_quantity:
            raise serializers.ValidationError(f"تعداد درخواستی بیشتر از موجودی محصول ({product.stock_quantity}) است.")
        
        # بررسی محدودیت فروش تکی
        if not product.allow_individual_sale and data['quantity'] < product.package_quantity:
            raise serializers.ValidationError(f"این محصول فقط به صورت بسته‌ای ({product.package_quantity} (عددی) قابل فروش است.")
        
        return data