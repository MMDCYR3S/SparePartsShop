from rest_framework import serializers

from apps.shop.models import Product, ProductImage, Category, Car

# ======= Product Image Serializers ======= #
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

# ======= Car Serializers ======= #
class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year']

# ======= Category Serializers ======= #
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']

# ======= Product Serializers ======= #
class ProductListSerializer(serializers.HyperlinkedModelSerializer):
    url_detail = serializers.HyperlinkedIdentityField(view_name='api:v1:product-detail')
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'url_detail', 'name', 'brand', 'part_code', 
            'price', 'category_name', 'is_in_stock', 'package_quantity'
        ]

# ======= Product Detail Serializers ======= #
class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    compatible_cars = CarSerializer(many=True, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    package_count = serializers.IntegerField(read_only=True)
    individual_items_available = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'part_code', 'brand', 
            'country_of_origin', 'warranty', 'price',
            'stock_quantity', 'package_quantity', 'allow_individual_sale',
            'is_in_stock', 'package_count', 'individual_items_available',
            'category', 'compatible_cars', 'images', 'is_active'
        ]