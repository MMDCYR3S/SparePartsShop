from slugify import slugify
from django.db import models

from .car_model import Car
from .category_model import Category

# =========== Product Image Model =========== #
class ProductImage(models.Model):
    """ مدل برای تصاویر محصولات """
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='images', verbose_name="محصول")
    image = models.ImageField(upload_to='products/', verbose_name="تصویر")
    is_main = models.BooleanField(default=False, verbose_name="تصویر اصلی")
    created_at = models.DateTimeField(verbose_name=("تاریخ ایجاد"), auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name=("تاریخ به روزرسانی"), auto_now=True)
    
    def __str__(self):
        return self.product.name
    

# =========== Product Model =========== #
class Product(models.Model):
    """
    مدل اصلی برای محصولات (لوازم یدکی)
    """
    name = models.CharField(max_length=200, verbose_name="نام قطعه")
    slug = models.SlugField(max_length=200, unique=True, blank=True, null=True, verbose_name="اسلاگ")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات")
    
    # مشخصات فنی کلیدی
    part_code = models.CharField(max_length=100, unique=True, verbose_name="کد قطعه")
    brand = models.CharField(max_length=100, verbose_name="برند")
    country_of_origin = models.CharField(max_length=100, verbose_name="کشور سازنده")
    warranty = models.CharField(max_length=100, blank=True, null=True, verbose_name="ضمانت")
    
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="قیمت")
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="تعداد موجودی")
    package_quantity = models.PositiveIntegerField(default=1, verbose_name="تعداد در هر بسته")
    allow_individual_sale = models.BooleanField(default=True, verbose_name="امکان فروش تکی")
    
    # روابط
    category = models.ForeignKey(Category, on_delete=models.PROTECT, verbose_name="دسته‌بندی")
    compatible_cars = models.ManyToManyField(Car, related_name='parts', verbose_name="خودروهای سازگار")
    
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    def __str__(self):
        return f"{self.name} - {self.brand}"

    @property
    def is_in_stock(self):
        """بررسی اینکه آیا محصول در انبار موجود است یا نه"""
        return self.stock_quantity > 0
    
    @property
    def package_count(self):
        """تعداد بسته‌های کامل موجود"""
        return self.stock_quantity // self.package_quantity if self.package_quantity > 0 else 0
    
    @property
    def individual_items_available(self):
        """تعداد آیتم‌های تکی باقی‌مانده پس از بسته‌های کامل"""
        return self.stock_quantity % self.package_quantity if self.package_quantity > 0 else self.stock_quantity

    def save(self, *args, **kwargs):
        """ ذخیره خودکار اسلاگ """
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"