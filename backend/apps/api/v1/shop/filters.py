import django_filters
from apps.shop.models import Product, Category, Car

# ======== Product Filter ======== #
class ProductFilter(django_filters.FilterSet):
    """
    فیلترینگ مربوط به محصولات
    این فیلترینگ براساس نام، برند، کد قطعه، قیمت، موجودی، دسته‌بندی، خودروهای سا‌زگار،
    برند، خودروهای سا‌زگار، سال ساخت خودرو، و قیمت با محدودیت‌هاهست.
    """
    name = django_filters.CharFilter(lookup_expr='icontains')
    brand = django_filters.CharFilter(lookup_expr='icontains')
    part_code = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    car_make = django_filters.CharFilter(method='filter_car_make')
    car_model = django_filters.CharFilter(method='filter_car_model')
    car_year = django_filters.NumberFilter(method='filter_car_year')
    
    class Meta:
        model = Product
        fields = ['name', 'brand', 'part_code', 'category', 'in_stock']
    
    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_quantity__gt=0)
        return queryset
    
    def filter_car_make(self, queryset, name, value):
        return queryset.filter(compatible_cars__make__icontains=value).distinct()
    
    def filter_car_model(self, queryset, name, value):
        return queryset.filter(compatible_cars__model__icontains=value).distinct()
    
    def filter_car_year(self, queryset, name, value):
        return queryset.filter(compatible_cars__year=value).distinct()