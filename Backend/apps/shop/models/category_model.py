from django.db import models
from slugify import slugify

# ======= Category Model ======= #
class Category(models.Model):
    """
    مدل برای دسته‌بندی‌ها و زیردسته‌بندی‌ها
    """
    name = models.CharField(max_length=100, verbose_name="نام دسته‌بندی")
    slug = models.SlugField(max_length=100, unique=True, null=True, blank=True, verbose_name="اسلاگ")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="دسته‌بندی والد")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """ ذخیره اسلاگ به صورت انگلیسی """
        
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        
    
    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
