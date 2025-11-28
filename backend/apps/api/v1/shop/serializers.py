from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.shop.models import Product, ProductImage, Category, Car

# ======= Product Image Serializers ======= #
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

# ======= Car Serializers ======= #
class CarSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name='api:v1:car-detail',
        lookup_field='pk'
    )

    products_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Car
        fields = ['id', 'make', 'model', 'year', 'url', 'products_url']
        
    def get_products_url(self, obj):
        request = self.context.get('request')
        url = reverse('api:v1:product-list', request=request)
        return f"{url}?compatible_cars={obj.id}"

# ======= Category Serializers ======= #
class CategorySerializer(serializers.ModelSerializer):
        
    url = serializers.HyperlinkedIdentityField(
        view_name='api:v1:category-detail',
        lookup_field='pk'
    )
    products_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'url', 'products_url']
        
    def get_products_url(self, obj):
        request = self.context.get('request')
        url = reverse('api:v1:product-list', request=request)
        return f"{url}?category={obj.id}"

# ======= Product Serializers ======= #
class ProductListSerializer(serializers.HyperlinkedModelSerializer):
    url_detail = serializers.HyperlinkedIdentityField(view_name='api:v1:product-detail')
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'url_detail', 'name', 'brand', 'part_code', 
            'price', 'category_name', "is_stock"
        ]

# ======= Product Detail Serializers ======= #
class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    compatible_cars = CarSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'part_code', 'brand', 
            'country_of_origin', 'warranty', 'price',
            'is_stock', 'allow_individual_sale',
            'category', 'compatible_cars', 'images', 'is_active'
        ]