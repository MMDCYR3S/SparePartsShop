from django.db import models

# ======= Category Model ======= #
class Category(models.Model):
    """
    مدل برای دسته‌بندی‌ها و زیردسته‌بندی‌ها
    """
    name = models.CharField(max_length=100, verbose_name="نام دسته‌بندی")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="دسته‌بندی والد")
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
