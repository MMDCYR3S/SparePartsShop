from django.db import models
from .car_model import Car
from .category_model import Category

class Product(models.Model):
    """
    مدل اصلی برای محصولات (لوازم یدکی)
    """
    name = models.CharField(max_length=200, verbose_name="نام قطعه")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات")
    
    # مشخصات فنی کلیدی
    part_code = models.CharField(max_length=100, unique=True, verbose_name="کد قطعه")
    brand = models.CharField(max_length=100, verbose_name="برند")
    country_of_origin = models.CharField(max_length=100, verbose_name="کشور سازنده")
    warranty = models.CharField(max_length=100, blank=True, null=True, verbose_name="ضمانت")
    
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="قیمت")
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="تعداد موجودی")
    
    # روابط
    category = models.ForeignKey(Category, on_delete=models.PROTECT, verbose_name="دسته‌بندی")
    compatible_cars = models.ManyToManyField(Car, related_name='parts', verbose_name="خودروهای سازگار")
    
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    def __str__(self):
        return f"{self.name} - {self.brand}"

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"